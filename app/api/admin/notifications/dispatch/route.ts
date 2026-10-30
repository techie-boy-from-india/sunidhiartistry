import { NextRequest, NextResponse } from "next/server";
import { adminFromRequest, isSameOrigin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { emailEnabled, sendQueuedEmail, smtpConfigured } from "@/lib/notifications";
export const runtime = "nodejs";
export async function POST(req:NextRequest) {
  if (!adminFromRequest(req)) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  if (!isSameOrigin(req)) return NextResponse.json({ error:"Invalid origin" }, { status:403 });
  if (!emailEnabled()) return NextResponse.json({ error:"Email notifications are disabled. Set EMAIL_NOTIFICATIONS_ENABLED=true after setup." }, { status:503 });
  if (!smtpConfigured()) return NextResponse.json({ error:"Gmail SMTP is not configured. Set SMTP_USER and SMTP_APP_PASSWORD." }, { status:503 });
  try {
    const entries=await db()<{id:string}[]>`
      SELECT id::text AS id FROM email_notifications WHERE status IN ('pending','failed')
      ORDER BY created_at ASC LIMIT 10
    `;
    let sent=0;
    for (const item of entries) {
      if (await sendQueuedEmail(item.id) === "sent") sent++;
      // Conservative pacing for a small Gmail mailbox.
      await new Promise(resolve=>setTimeout(resolve,900));
    }
    return NextResponse.json({ ok:true,accepted:sent,attempted:entries.length }, { headers:{"Cache-Control":"no-store"} });
  } catch { return NextResponse.json({ error:"Could not process the email queue. Check the database migration." }, { status:503 }); }
}
