import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { z } from "zod";

export const runtime = "nodejs";
const schema = z.object({
 name: z.string().trim().min(2).max(100),
 email: z.email().max(255),
 phone: z.string().trim().regex(/^[+\d\s()-]{7,20}$/),
 service: z.enum(["Bridal Makeup", "Engagement Makeup", "Party Makeup", "Special Occasion"]),
 eventDate: z.union([z.iso.date(), z.literal("")]).optional(),
 message: z.string().trim().max(1500).default(""),
 website: z.string().max(200).default(""),
});
export async function POST(request: NextRequest) {
 const origin = request.headers.get("origin");
 const host = request.headers.get("host");
 if (origin && host && new URL(origin).host !== host) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
 const len = Number(request.headers.get("content-length") || 0);
 if (len > 12000) return NextResponse.json({ error: "Request too large." }, { status: 413 });
 let body: unknown;
 try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
 const parsed = schema.safeParse(body);
 if (!parsed.success) return NextResponse.json({ error: "Please check your form details." }, { status: 400 });
 if (parsed.data.website) return NextResponse.json({ ok: true }, { status: 202 });
 if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Online enquiries are being configured. Please contact the artist directly." }, { status: 503 });
 try {
  const sql = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 8, idle_timeout: 5 });
  try { const d = parsed.data; await sql`INSERT INTO enquiries (name,email,phone,service,event_date,message) VALUES (${d.name},${d.email},${d.phone},${d.service},${d.eventDate || null},${d.message})`; }
  finally { await sql.end(); }
  return NextResponse.json({ ok: true }, { status: 201 });
 } catch (error) { console.error("Enquiry storage failed", error instanceof Error ? error.message : "unknown"); return NextResponse.json({ error: "Sorry, we could not save your enquiry. Please try again later." }, { status: 503 }); }
}
