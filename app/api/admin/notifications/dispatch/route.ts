import { NextRequest, NextResponse } from "next/server";
import { adminFromRequest, isSameOrigin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { emailEnabled, sendQueuedEmail } from "@/lib/notifications";
export const runtime = "nodejs";
export async function POST(req:NextRequest) {
  if (!adminFromRequest(req)) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  if (!isSameOrigin(req)) return NextResponse.json({ error:"Invalid origin" }, { status:403 });
  if (!emailEnabled()) return NextResponse.json({ error:"Email notifications are disabled. Set EMAIL_NOTIFICATIONS_ENABLED=true after setup." }, { status:503 });
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return NextResponse.json({ error:"Email provider is not yet configured." }, { status:503 });
  try {
    const entries=await db()<{id:string}[]>`
      SELECT id::text AS id FROM email_notifications WHERE status IN ('pending','failed')
      ORDER BY created_at ASC LIMIT 10
    `;
    let sent=0;
    for (const item of entries) {
      if (await sendQueuedEmail(item.id) === "sent") sent++;
      // Keep well under Resend's normal API rate limit.
      await new Promise(resolve=>setTimeout(resolve,650));
    }
    return NextResponse.json({ ok:true,accepted:sent,attempted:entries.length }, { headers:{"Cache-Control":"no-store"} });
  } catch { return NextResponse.json({ error:"Could not process the email queue. Check the database migration." }, { status:503 }); }
}
