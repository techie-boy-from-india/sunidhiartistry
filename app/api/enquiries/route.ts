import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";
const services = ["Bridal Makeup","Engagement Makeup","Reception Makeup","Party Makeup","Photoshoot Makeup","Event Makeup"] as const;
const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(255),
  phone: z.string().trim().regex(/^[+\d\s()-]{7,20}$/),
  service: z.enum(services),
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
  if (value.website) return NextResponse.json({ ok: true }, { status: 202 });
  if (value.requestType === "booking" && !value.eventDate) return error("Please select an event date.", 400);
  if (value.eventDate && value.eventDate < new Date().toISOString().slice(0, 10)) return error("Please select a future event date.", 400);
  if (!process.env.DATABASE_URL) return error("Enquiries are being configured. Please contact the artist directly.", 503);
  try {
    const sql = db();
    await sql.begin(async tx => {
      const [enquiry] = await tx`
        INSERT INTO enquiries (name, email, phone, service, event_date, message, request_type)
        VALUES (${value.name}, ${value.email.toLowerCase()}, ${value.phone}, ${value.service},
          ${value.eventDate || null}, ${value.message}, ${value.requestType})
        RETURNING id
      `;
      if (value.requestType === "booking") {
        await tx`INSERT INTO bookings (enquiry_id) VALUES (${enquiry.id})`;
      }
    });
    return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return error("We could not save the request. Please try again or contact us on WhatsApp.", 503);
  }
}
