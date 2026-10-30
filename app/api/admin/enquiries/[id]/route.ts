import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminFromRequest, isSameOrigin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
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
    const rows = await db()`UPDATE enquiries SET status = ${validated.data.status} WHERE id = ${id}::bigint RETURNING id`;
    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Could not update the enquiry" }, { status: 503 }); }
}
