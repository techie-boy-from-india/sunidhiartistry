import type { TransactionSql } from "postgres";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

type Tx = TransactionSql<Record<string, never>>;
export type BookingEmailEvent = "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled" | "payment_updated";
export type EnquiryEmailEvent = "contacted" | "quoted" | "converted";
export type DeliveryResult = "sent" | "queued" | "disabled";
type EmailRow = { id: string; recipient_email: string; subject: string; html_body: string; text_body: string };
type BookingData = { name: string; email: string; service: string; date: string | null; start: string | null; end: string | null; total: string; received: string };
type EnquiryData = { name: string; email: string; service: string };
export function emailEnabled(): boolean { return process.env.EMAIL_NOTIFICATIONS_ENABLED === "true"; }

function safe(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function localDate(date: string | null) {
  if (!date) return "To be arranged";
  return new Date(date + "T00:00:00Z").toLocaleDateString("en-IN", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });
}
function amount(paise: string) { return "₹" + (Number(paise) / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 }); }
function siteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://sunidhimakeup.vercel.app";
  try { const parsed = new URL(url); return parsed.protocol === "https:" ? parsed.origin : "https://sunidhimakeup.vercel.app"; }
  catch { return "https://sunidhimakeup.vercel.app"; }
}
function buildContent(input: {
  recipient: string; subject: string; heading: string; subtitle: string;
  rows: Array<[string,string]>; closing: string;
}) {
  const text = `Hello ${input.recipient},

${input.heading}

${input.subtitle}

${input.rows.map(([k,v]) => k + ": " + v).join("\n")}

${input.closing}

For questions, reply to this email or contact Sunidhi Artistry.

Sunidhi Artistry
${siteUrl()}
`;
  const rows = input.rows.map(([key,value]) =>
    `<tr><td style="font:600 11px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#9f8091;padding:13px 14px;border-bottom:1px solid #f1e2eb;width:40%;">${safe(key)}</td><td style="font:500 14px Arial,sans-serif;color:#402e3c;padding:13px 14px;border-bottom:1px solid #f1e2eb;">${safe(value)}</td></tr>`
  ).join("");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;background:#faf4f7;padding:35px 12px;color:#382638;">
<table role="presentation" style="margin:0 auto;max-width:610px;width:100%;border-collapse:collapse;background:#fff;border:1px solid #f3e1e9;border-radius:15px;overflow:hidden;">
<tr><td style="background:#fce8ef;padding:31px 35px;text-align:center;"><span style="color:#aa507b;letter-spacing:3px;font:700 10px Arial,sans-serif;">THE ART OF BEAUTY</span><div style="font:normal 34px Georgia,serif;color:#3b2634;margin:12px 0 4px;">Sunidhi <em style="color:#d979a0;font-weight:normal">Artistry</em></div><span style="color:#9b687d;letter-spacing:2px;font:10px Arial,sans-serif;">BRIDAL & OCCASION MAKEUP</span></td></tr>
<tr><td style="padding:38px 35px 35px;"><div style="font:700 10px Arial,sans-serif;color:#d36895;letter-spacing:2px;">A PERSONAL UPDATE FOR YOU</div>
<h1 style="font:normal 32px/1.3 Georgia,serif;color:#362333;margin:16px 0;">${safe(input.heading)}</h1>
<p style="font:14px/1.9 Arial,sans-serif;color:#6d5c66;margin:0 0 23px;">Hello ${safe(input.recipient)},<br>${safe(input.subtitle)}</p>
<table role="presentation" style="border-collapse:collapse;width:100%;background:#fffafe;border:1px solid #f1e2eb;border-radius:9px;">${rows}</table>
<p style="font:14px/1.9 Arial,sans-serif;color:#66545f;margin:25px 0;">${safe(input.closing)}</p>
<p style="font:12px/1.8 Arial,sans-serif;color:#9b8290;margin:20px 0 0;">Have a question? Just reply to this email.</p>
</td></tr>
<tr><td style="background:#372532;padding:24px 35px;text-align:center;"><div style="font:17px Georgia,serif;color:#ffe9f0;">Beautiful moments, thoughtfully made.</div>
<a href="${safe(siteUrl())}" style="font:12px Arial,sans-serif;color:#e7b4ca;display:inline-block;margin-top:13px;">Visit Sunidhi Artistry</a></td></tr>
</table><p style="font:11px Arial,sans-serif;color:#a58a99;text-align:center;margin-top:20px;">This is a transactional update about your booking or enquiry.</p></body></html>`;
  return { subject: input.subject, text, html };
}
function bookingTemplate(type: BookingEmailEvent, row: BookingData) {
  const title: Record<BookingEmailEvent,string> = {
    pending:"Booking request pending", confirmed:"Your booking is confirmed!",
    completed:"Thank you for celebrating with us", cancelled:"Your booking has been cancelled",
    rescheduled:"Your appointment details have changed", payment_updated:"Your booking payment details have been updated"
  };
  const subtitle: Record<BookingEmailEvent,string> = {
    pending:"Your appointment request is now marked pending. We will contact you about availability and next steps. Your date is not confirmed yet.",
    confirmed:"Wonderful news! Your appointment with Sunidhi Artistry has been confirmed. Here are the details:",
    completed:"Your appointment is marked complete. We hope you loved your experience!",
    cancelled:"We are writing to let you know that this appointment has been cancelled. Please contact us if you have questions or would like to request another date.",
    rescheduled:"Your appointment date or time has been updated in our records. Please review the new details below.",
    payment_updated:"We've updated the payment information recorded for your booking. Please review the details below."
  };
  const details: Array<[string,string]> = [
    ["Service",row.service],
    ["Event date",localDate(row.date)],
    ["Appointment time",row.start && row.end ? row.start + " – " + row.end + " (IST)" : "All-day / time to be arranged"]
  ];
  if (type === "payment_updated") {
    details.push(["Agreed amount",amount(row.total)],["Received (recorded)",amount(row.received)],["Outstanding",amount(String(Number(row.total)-Number(row.received)))]);
  }
  const closing = type === "payment_updated"
    ? "This is a summary of manually recorded amounts, not an automated payment receipt. Please contact us if anything looks incorrect."
    : type === "rescheduled" ? "If this change does not work for you, please reply so we can discuss alternatives."
    : type === "cancelled" ? "If you have paid an advance, please contact us to discuss any applicable refund arrangements."
    : "We look forward to making your day special. Feel free to reply with any questions.";
  return buildContent({ recipient:row.name, heading:title[type], subject:"Sunidhi Artistry | "+title[type], subtitle:subtitle[type], rows:details, closing });
}
function enquiryTemplate(type: EnquiryEmailEvent, row: EnquiryData) {
  const messages: Record<EnquiryEmailEvent,[string,string]> = {
    contacted:["We're following up on your enquiry","Thank you for reaching out! We have updated the progress of your enquiry and will be happy to discuss the next steps with you."],
    quoted:["Update on your makeup enquiry","Your enquiry has progressed to the quotation stage. Please contact us to discuss the personalised price and details; no quotation is attached to this email."],
    converted:["Thank you for choosing Sunidhi Artistry","Your enquiry has been marked as moving forward. Any actual appointment is confirmed separately after availability checks."]
  };
  const [heading,subtitle] = messages[type];
  return buildContent({ recipient:row.name, heading, subject:"Sunidhi Artistry | "+heading, subtitle, rows:[["Service",row.service]], closing:"We'd love to help you prepare for a beautiful occasion. Reply with any questions." });
}
async function insert(tx: Tx, data: { event: string; bookingId?: string; enquiryId?: string; email: string; content: { subject:string;text:string;html:string } }) {
  const [row] = await tx<{ id:string }[]>`
    INSERT INTO email_notifications (booking_id,enquiry_id,event_type,recipient_email,subject,html_body,text_body)
    VALUES (${data.bookingId || null}::bigint,${data.enquiryId || null}::bigint,${data.event},${data.email},
      ${data.content.subject},${data.content.html},${data.content.text}) RETURNING id::text AS id
  `;
  return row.id;
}
export async function enqueueBooking(tx:Tx,id:string,event:BookingEmailEvent):Promise<string|null> {
  if (!emailEnabled()) return null;
  const [row] = await tx<BookingData[]>`
    SELECT e.name,e.email,e.service,e.event_date::text AS date,
      to_char(b.start_time,'HH24:MI') AS start,to_char(b.end_time,'HH24:MI') AS "end",
      b.total_amount_paise::text AS total,b.amount_paid_paise::text AS received
    FROM bookings b JOIN enquiries e ON e.id=b.enquiry_id WHERE b.id=${id}::bigint
  `;
  if (!row?.email) return null;
  return insert(tx,{event:"booking_"+event,bookingId:id,email:row.email,content:bookingTemplate(event,row)});
}
export async function enqueueEnquiry(tx:Tx,id:string,event:EnquiryEmailEvent):Promise<string|null> {
  if (!emailEnabled()) return null;
  const [row] = await tx<EnquiryData[]>`
    SELECT name,email,service FROM enquiries WHERE id=${id}::bigint AND request_type='enquiry'
  `;
  if (!row?.email) return null;
  return insert(tx,{event:"enquiry_"+event,enquiryId:id,email:row.email,content:enquiryTemplate(event,row)});
}
export function smtpConfigured(): boolean {
  const email=process.env.SMTP_USER?.trim();
  return Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    process.env.SMTP_APP_PASSWORD?.trim());
}

function smtpErrorCode(error: unknown): string {
  // Do not save raw SMTP errors: provider messages can contain private details.
  const code = error && typeof error==="object" && "code" in error ? String(error.code) : "";
  if (code === "EAUTH") return "Gmail authentication failed. Check SMTP_USER and App Password.";
  if (code === "ETIMEDOUT" || code === "ECONNECTION" || code === "ESOCKET") return "Gmail SMTP connection timed out or failed.";
  if (code === "EENVELOPE") return "Gmail rejected the recipient address.";
  return "Gmail SMTP did not accept the message. Check Gmail Sent/Google security alerts.";
}

export function ownerAlertsConfigured(): boolean {
  const address=process.env.ADMIN_ALERT_EMAIL?.trim();
  return process.env.ADMIN_NEW_REQUEST_ALERTS === "true" &&
    emailEnabled() && smtpConfigured() &&
    Boolean(address && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(address));
}

export async function enqueueOwnerNewRequest(
  tx:Tx, enquiryId:string, kind:"booking"|"enquiry", bookingId:string|null
):Promise<string|null> {
  if (!ownerAlertsConfigured()) return null;
  const recipient=process.env.ADMIN_ALERT_EMAIL!.trim();
  const [row]=await tx<{
    name:string; email:string; phone:string; service:string;
    eventDate:string|null; message:string;
  }[]>`
    SELECT name,email,phone,service,event_date::text AS "eventDate",message
    FROM enquiries WHERE id=${enquiryId}::bigint
  `;
  if (!row) return null;
  const isBooking=kind==="booking";
  const heading=isBooking?"New booking request received":"New makeup enquiry received";
  const content=buildContent({
    recipient:"Sunidhi Artistry team",
    heading,
    subtitle:isBooking ?
      "A customer has requested an appointment. Please check the dashboard, confirm availability and follow up." :
      "A new customer enquiry has arrived. Please review the details and follow up.",
    subject:"Sunidhi Artistry | "+(isBooking?"New booking request":"New enquiry")+" — "+row.service,
    rows:[
      ["Customer",row.name],["Email",row.email],["Phone",row.phone],
      ["Service",row.service],["Event date",localDate(row.eventDate)],
      ["Message",row.message.slice(0,600) || "Not provided"],
      ["Manage","Sign in to the private admin dashboard: "+siteUrl()+"/admin?tab="+(isBooking?"bookings":"enquiries")]
    ],
    closing:"This is an internal staff alert. The appointment is not confirmed automatically."
  });
  return insert(tx,{
    event:isBooking?"admin_booking_received":"admin_enquiry_received",
    bookingId:bookingId||undefined,enquiryId,email:recipient,content
  });
}

export async function sendQueuedEmail(id:string|null):Promise<DeliveryResult> {
  if (!emailEnabled()) return "disabled";
  if (!id || !smtpConfigured()) return "queued";
  const smtpUser=process.env.SMTP_USER!.trim();
  const appPassword=process.env.SMTP_APP_PASSWORD!.replace(/\s/g,"");
  // Atomic claim prevents two simultaneous API handlers sending the same event.
  let row: EmailRow | undefined;
  try {
    const rows=await db()<EmailRow[]>`
      UPDATE email_notifications SET status='sending',claimed_at=now(),attempts=attempts+1,last_error=NULL
      WHERE id=${id}::bigint AND
        (status IN ('pending','failed') OR (status='sending' AND claimed_at < now()-INTERVAL '10 minutes'))
      RETURNING id::text AS id, recipient_email, subject, html_body, text_body
    `;
    row=rows[0];
    if (!row) return "queued";
  } catch { return "queued"; }
  const transporter=nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth:{ user:smtpUser, pass:appPassword },
    connectionTimeout:8000,
    greetingTimeout:6000,
    socketTimeout:12000,
    tls:{ minVersion:"TLSv1.2" }
  });
  try {
    const replyTo=process.env.EMAIL_REPLY_TO?.trim();
    const info=await transporter.sendMail({
      from:{ name:process.env.EMAIL_FROM_NAME?.trim().slice(0,80) || "Sunidhi Artistry", address:smtpUser },
      to:row.recipient_email,
      subject:row.subject,
      html:row.html_body,
      text:row.text_body,
      ...(replyTo ? { replyTo } : {})
    });
    if (!info.accepted.map(x=>x.toLowerCase()).includes(row.recipient_email.toLowerCase())) {
      throw Object.assign(new Error("Recipient was not accepted"),{code:"EENVELOPE"});
    }
    const messageId=info.messageId?.slice(0,250) || null;
    await db()`UPDATE email_notifications SET status='sent',sent_at=now(),provider_id=${messageId},last_error=NULL
      WHERE id=${id}::bigint AND status='sending'`;
    return "sent";
  } catch(error) {
    const reason=smtpErrorCode(error);
    try {
      await db()`UPDATE email_notifications SET status='failed',last_error=${reason}
        WHERE id=${id}::bigint AND status='sending'`;
    } catch { /* Remains recoverable for an admin retry. */ }
    return "queued";
  } finally {
    transporter.close();
  }
}

export async function pendingNotifications() {
  if (!emailEnabled()) return { enabled:false,pending:0,failed:0 };
  const [row] = await db()<{ pending:number; failed:number }[]>`
    SELECT COUNT(*) FILTER(WHERE status IN ('pending','sending'))::int AS pending,
      COUNT(*) FILTER(WHERE status='failed')::int AS failed FROM email_notifications
  `;
  return { enabled:true,pending:row.pending,failed:row.failed };
}
