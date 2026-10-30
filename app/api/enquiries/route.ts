import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCms, visibleCms } from "@/lib/cms";
import { enqueueOwnerNewRequest, ownerAlertsConfigured, sendQueuedEmail } from "@/lib/notifications";
import { enforceSubmissionLimits, SubmissionLimited } from "@/lib/public-submission-limit";

export const runtime = "nodejs";
const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(255),
  phone: z.string().trim().regex(/^[+\d\s()-]{7,20}$/),
  service: z.string().trim().min(1).max(120),
  eventDate: z.union([z.iso.date(), z.literal("")]).optional(),
  requestType: z.enum(["booking", "enquiry"]).default("enquiry"),
  message: z.string().trim().max(1500).default(""),
  website: z.string().max(200).default("")
});
function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return error("Invalid request origin.", 403);
  if (Number(req.headers.get("content-length") || 0) > 12000) return error("Request too large.", 413);
  let body: unknown;
  try { body = await req.json(); } catch { return error("Invalid request.", 400); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Please check the enquiry details.", 400);
  const value = parsed.data;
  const {data}=await getCms();
  if (!visibleCms(data).services.some(s=>s.name===value.service)) return error("Please choose an available service.",400);
  if (value.website) return NextResponse.json({ ok: true }, { status: 202 });
  if (value.requestType === "booking" && !value.eventDate) return error("Please select an event date.", 400);
  if (value.eventDate && value.eventDate < new Date().toISOString().slice(0, 10)) return error("Please select a future event date.", 400);
  if (!process.env.DATABASE_URL) return error("Enquiries are being configured. Please contact the artist directly.", 503);
  try {
    const sql = db();
    const alertReady=ownerAlertsConfigured();
    const noticeId=await sql.begin(async tx => {
      if(alertReady) await enforceSubmissionLimits(tx,req,value.email);
      const [enquiry] = await tx`
        INSERT INTO enquiries (name, email, phone, service, event_date, message, request_type)
        VALUES (${value.name}, ${value.email.toLowerCase()}, ${value.phone}, ${value.service},
          ${value.eventDate || null}, ${value.message}, ${value.requestType})
        RETURNING id
      `;
      let bookingId:string|null=null;
      if (value.requestType === "booking") {
        const [booking]=await tx<{id:string}[]>`
          INSERT INTO bookings (enquiry_id) VALUES (${enquiry.id}) RETURNING id::text AS id
        `;
        bookingId=booking.id;
      }
      return alertReady ?
        enqueueOwnerNewRequest(tx,String(enquiry.id),value.requestType,bookingId) : null;
    });
    if (noticeId) {
      // Schedule delivery after the HTTP response; failed sends remain in the outbox.
      after(async () => { await sendQueuedEmail(noticeId); });
    }
    return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if(e instanceof SubmissionLimited) return error(e.message,429);
    return error("We could not save the request. Please try again or contact us on WhatsApp.", 503);
  }
}
