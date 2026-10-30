import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ADMIN_COOKIE, SESSION_AGE_SECONDS, authConfigured, checkPassword, isSameOrigin, newSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
const loginSchema = z.object({ email: z.email().max(255), password: z.string().min(1).max(256) });
function deny(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return deny("Invalid request origin.", 403);
  if (!authConfigured()) return deny("Admin login is not configured yet.", 503);
  if (Number(req.headers.get("content-length") || "0") > 4096) return deny("Invalid login.", 400);
  let payload: unknown;
  try { payload = await req.json(); } catch { return deny("Invalid login.", 400); }
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) return deny("Invalid email or password.", 401);
  const email = parsed.data.email.trim().toLowerCase();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) || "unknown";
  const keyHash = createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(`${email}|${ip}`).digest("hex");
  try {
    const sql = db();
    const limit = await sql<{ attempts: number; locked: boolean }[]>`
      SELECT attempts, window_start > now() - INTERVAL '15 minutes' AS locked
      FROM admin_login_attempts WHERE key_hash = ${keyHash}
    `;
    if (limit[0]?.locked && limit[0].attempts >= 5) return deny("Too many attempts. Try again in 15 minutes.", 429);

    const correctEmail = email === process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const correctPassword = checkPassword(parsed.data.password);
    if (!correctEmail || !correctPassword) {
      await sql`
        INSERT INTO admin_login_attempts (key_hash, attempts, window_start, updated_at)
        VALUES (${keyHash}, 1, now(), now())
        ON CONFLICT (key_hash) DO UPDATE SET
          attempts = CASE WHEN admin_login_attempts.window_start < now() - INTERVAL '15 minutes'
            THEN 1 ELSE admin_login_attempts.attempts + 1 END,
          window_start = CASE WHEN admin_login_attempts.window_start < now() - INTERVAL '15 minutes'
            THEN now() ELSE admin_login_attempts.window_start END,
          updated_at = now()
      `;
      return deny("Invalid email or password.", 401);
    }

    await sql`DELETE FROM admin_login_attempts WHERE key_hash = ${keyHash}`;
    const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(ADMIN_COOKIE, newSession(email), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_AGE_SECONDS });
    return response;
  } catch {
    return deny("Login service temporarily unavailable. Check database setup.", 503);
  }
}

export async function DELETE(req: NextRequest) {
  if (!isSameOrigin(req)) return deny("Invalid request origin.", 403);
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
