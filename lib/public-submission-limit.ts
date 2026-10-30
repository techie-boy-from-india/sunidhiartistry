import { createHmac } from "node:crypto";
import type { TransactionSql } from "postgres";
import type { NextRequest } from "next/server";

type Tx=TransactionSql<Record<string,never>>;
export class SubmissionLimited extends Error {
  constructor() {super("Too many recent requests. Please try again later or contact Sunidhi Artistry directly.");}
}
function keyHash(value:string) {
  const secret=process.env.ADMIN_SESSION_SECRET;
  if(!secret || secret.length<32) throw new Error("ADMIN_SESSION_SECRET must be configured for public submission throttling.");
  return createHmac("sha256",secret).update(value).digest("hex");
}
async function increase(tx:Tx,key:string,max:number) {
  const [row]=await tx<{hits:number}[]>`
    INSERT INTO public_submission_limits (key_hash,hits,window_start,updated_at)
    VALUES (${key},1,now(),now())
    ON CONFLICT (key_hash) DO UPDATE SET
      hits=CASE WHEN public_submission_limits.window_start < now()-interval '1 hour'
        THEN 1 ELSE public_submission_limits.hits+1 END,
      window_start=CASE WHEN public_submission_limits.window_start < now()-interval '1 hour'
        THEN now() ELSE public_submission_limits.window_start END,
      updated_at=now()
    RETURNING hits
  `;
  if(row.hits>max) throw new SubmissionLimited();
}
export async function enforceSubmissionLimits(tx:Tx,req:NextRequest,email:string) {
  // Vercel sets a trusted forwarding header on hosted deployments. A forged
  // forwarded IP can reduce throttling effectiveness; this is not CAPTCHA/WAF.
  const raw=req.headers.get("x-vercel-forwarded-for") || req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const ip=raw.split(",")[0].trim().slice(0,64);
  // One IP gets 8 submissions/hour; one email gets 3/hour.
  await increase(tx,keyHash("ip:"+ip),8);
  await increase(tx,keyHash("email:"+email.toLowerCase()),3);
}
