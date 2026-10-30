import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminFromRequest, isSameOrigin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { enqueueEnquiry, sendQueuedEmail, emailEnabled } from "@/lib/notifications";
export const runtime = "nodejs";
const schema = z.object({ status: z.enum(["new", "contacted", "quoted", "converted", "lost"]) });
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const { id } = await params;
  if (!/^\d{1,18}$/.test(id)) return NextResponse.json({ error: "Invalid record" }, { status: 400 });
  if (Number(req.headers.get("content-length") || "0") > 1024) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  let payload: unknown;
  try { payload = await req.json(); } catch { return NextResponse.json({ error: "Invalid payload" }, { status: 400 }); }
  const validated = schema.safeParse(payload);
  if (!validated.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  try {
    const outcome=await db().begin(async tx => {
      const [entry]=await tx<{status:string}[]>`
        SELECT status FROM enquiries WHERE id=${id}::bigint AND request_type='enquiry' FOR UPDATE
      `;
      if (!entry) return { found:false, noticeId:null };
      if (entry.status===validated.data.status) return { found:true,noticeId:null };
      await tx`UPDATE enquiries SET status=${validated.data.status} WHERE id=${id}::bigint`;
      const customerRelevant=["contacted","quoted","converted"] as const;
      const noticeId=customerRelevant.some(s=>s===validated.data.status)
        ? await enqueueEnquiry(tx,id,validated.data.status as "contacted" | "quoted" | "converted") : null;
      return {found:true,noticeId};
    });
    if (!outcome.found) return NextResponse.json({ error:"Not found" }, { status:404 });
    const email=outcome.noticeId ? await sendQueuedEmail(outcome.noticeId) : (emailEnabled() ? "unchanged" : "disabled");
    return NextResponse.json({ ok:true,email }, { headers:{"Cache-Control":"no-store"} });
  } catch { return NextResponse.json({ error: "Could not update the enquiry" }, { status: 503 }); }
}
