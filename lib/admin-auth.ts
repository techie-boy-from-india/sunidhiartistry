import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "sunidhi_admin";
export const SESSION_AGE_SECONDS = 8 * 60 * 60;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("ADMIN_SESSION_SECRET needs 32+ characters");
  return value;
}
export function authConfigured() {
  return Boolean(process.env.DATABASE_URL && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);
}

export function checkPassword(password: string) {
  const encoded = process.env.ADMIN_PASSWORD_HASH || "";
  const [algorithm, roundsText, rText, pText, salt, expected] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !expected || roundsText !== "16384" || rText !== "8" || pText !== "1") return false;
  try {
    const reference = Buffer.from(expected, "base64url");
    if (reference.length !== 64) return false;
    const actual = scryptSync(password, Buffer.from(salt, "base64url"), 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    return timingSafeEqual(reference, actual);
  } catch { return false; }
}

type Session = { email: string; expires: number };
function sign(data: string) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}
export function newSession(email: string) {
  const data = Buffer.from(JSON.stringify({ email, expires: Date.now() + SESSION_AGE_SECONDS * 1000 } satisfies Session)).toString("base64url");
  return `${data}.${sign(data)}`;
}
export function validSession(token: string | undefined): boolean {
  if (!token || token.length > 1400 || !authConfigured()) return false;
  const [data, mac, extra] = token.split(".");
  if (!data || !mac || extra) return false;
  try {
    const actual = Buffer.from(mac, "base64url");
    const expected = Buffer.from(sign(data), "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const payload: unknown = JSON.parse(Buffer.from(data, "base64url").toString());
    if (!payload || typeof payload !== "object") return false;
    const { email, expires } = payload as Partial<Session>;
    return typeof email === "string" && email === process.env.ADMIN_EMAIL?.toLowerCase() && typeof expires === "number" && expires > Date.now() && expires <= Date.now() + SESSION_AGE_SECONDS * 1000;
  } catch { return false; }
}
export async function isAdmin() {
  const store = await cookies();
  return validSession(store.get(ADMIN_COOKIE)?.value);
}
export function adminFromRequest(req: NextRequest) {
  return validSession(req.cookies.get(ADMIN_COOKIE)?.value);
}
export function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    const url = new URL(origin);
    return url.host === host && (url.protocol === "https:" || (url.protocol === "http:" && (host.startsWith("localhost") || host.startsWith("127.0.0.1"))));
  } catch { return false; }
}
