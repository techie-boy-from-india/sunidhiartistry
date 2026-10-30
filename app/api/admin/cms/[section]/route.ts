import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { adminFromRequest,isSameOrigin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const runtime="nodejs";
const title=z.string().trim().min(1).max(120);
const short=z.string().trim().max(180);
const desc=z.string().trim().min(1).max(2000);
const category=z.enum(["Bridal","Engagement","Reception","Party","Event"]);
const safeSrc=z.string().trim().refine(src=>{
  if(/^[-\w]+\.(webp|jpg|jpeg|png)$/.test(src)) return true;
  try {
    const url=new URL(src);
    return url.protocol==="https:" && url.hostname.endsWith(".public.blob.vercel-storage.com");
  }catch{return false;}
},"Use an approved local image or a Vercel Blob upload.");
const schemas={
  settings:z.object({
    phone:z.string().trim().min(7).max(35),
    whatsapp:z.url().startsWith("https://wa.me/").max(250),
    email:z.email().max(255),
    instagramHandle:z.string().trim().max(80),
    instagram:z.url().startsWith("https://www.instagram.com/").max(250),
    city:z.string().trim().min(2).max(180)
  }).strict(),
  copy:z.object({
    heroTitle:title,heroAccent:title,heroDescription:desc,
    aboutHeading:title,aboutDescription:desc,experienceClaim:short,bridalClaim:short
  }).strict(),
  services:z.array(z.object({
    name:title,price:short,desc:desc,image:safeSrc,category,active:z.boolean()
  }).strict()).max(30).refine(rows=>new Set(rows.map(x=>x.name.toLowerCase())).size===rows.length,"Service names must be unique."),
  packages:z.array(z.object({
    name:title,sub:short,price:short,items:z.array(title).min(1).max(20),active:z.boolean()
  }).strict()).max(15).refine(rows=>new Set(rows.map(x=>x.name.toLowerCase())).size===rows.length,"Package names must be unique."),
  gallery:z.array(z.object({src:safeSrc,category,alt:title,active:z.boolean()}).strict()).max(100)
    .refine(rows=>new Set(rows.map(x=>x.src)).size===rows.length,"Photos must not be duplicated."),
  testimonials:z.array(z.object({
    name:title,quote:desc,context:short,active:z.boolean()
  }).strict()).max(40)
} as const;
type CmsSection=keyof typeof schemas;
function send(error:string,status:number) {
  return NextResponse.json({error},{status,headers:{"Cache-Control":"no-store"}});
}
export async function PATCH(req:NextRequest,{params}:{params:Promise<{section:string}>}) {
  if(!adminFromRequest(req)) return send("Unauthorized",401);
  if(!isSameOrigin(req)) return send("Invalid request origin",403);
  const {section}=await params;
  if(!(section in schemas))return send("Unknown section",404);
  if(Number(req.headers.get("content-length")||0)>120000)return send("Content exceeds 120 KB",413);
  let body:unknown;
  try{body=await req.json();}catch{return send("Invalid JSON",400);}
  const envelope=z.object({value:z.unknown(),revision:z.number().int().min(1)}).strict().safeParse(body);
  if(!envelope.success)return send("Invalid data or revision",400);
  const schema=schemas[section as CmsSection] as z.ZodType;
  const parsed=schema.safeParse(envelope.data.value);
  if(!parsed.success)return send(parsed.error.issues[0]?.message||"Check your content",400);
  const value=JSON.stringify(parsed.data);
  if(value.length>100000)return send("Section is too large",413);
  try {
    const rows=await db()<[{revision:number}]>`
      UPDATE cms_sections SET value=${value}::jsonb,revision=revision+1,updated_at=now()
      WHERE section=${section} AND revision=${envelope.data.revision}
      RETURNING revision
    `;
    if(!rows.length)return send("Content was modified or CMS is not activated. Refresh before saving.",409);
    return NextResponse.json({ok:true,revision:rows[0].revision},{headers:{"Cache-Control":"no-store"}});
  }catch{return send("Content storage unavailable. Run db/006_cms.sql.",503);}
}
