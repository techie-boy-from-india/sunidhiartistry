import { put } from "@vercel/blob";
import { NextRequest,NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { adminFromRequest,isSameOrigin } from "@/lib/admin-auth";

export const runtime="nodejs";
// Keep server uploads well below Vercel's 4.5 MB body limit.
const MAX=3*1024*1024;
function fail(message:string,status:number){return NextResponse.json({error:message},{status,headers:{"Cache-Control":"no-store"}});}
function matchesType(bytes:Uint8Array,type:string) {
  if(type==="image/jpeg")return bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
  if(type==="image/png")return bytes.slice(0,8).join(",")==="137,80,78,71,13,10,26,10";
  if(type==="image/webp")return String.fromCharCode(...bytes.slice(0,4))==="RIFF" &&
    String.fromCharCode(...bytes.slice(8,12))==="WEBP";
  return false;
}
export async function POST(req:NextRequest) {
  if(!adminFromRequest(req))return fail("Unauthorized",401);
  if(!isSameOrigin(req))return fail("Invalid request origin",403);
  if(!process.env.BLOB_READ_WRITE_TOKEN)return fail("Create a Public Vercel Blob store and connect it to this project first.",503);
  if(Number(req.headers.get("content-length")||0)>MAX+100000)return fail("Image is too large. Maximum 3 MB.",413);
  let file:File|null=null;
  try {
    const form=await req.formData();
    const input=form.get("image");
    if(input instanceof File)file=input;
  }catch{return fail("Could not read image",400);}
  if(!file||file.size===0||file.size>MAX)return fail("Choose a photo under 3 MB.",400);
  if(!["image/jpeg","image/png","image/webp"].includes(file.type))return fail("Only JPG, PNG and WebP are supported.",400);
  const bytes=new Uint8Array(await file.arrayBuffer());
  if(!matchesType(bytes,file.type))return fail("Image file signature doesn't match its type.",400);
  const ext=file.type==="image/jpeg"?"jpg":file.type==="image/png"?"png":"webp";
  try {
    const blob=await put("sunidhi-portfolio/"+randomUUID()+"."+ext,bytes,{
      access:"public",contentType:file.type,addRandomSuffix:true
    });
    return NextResponse.json({ok:true,url:blob.url},{headers:{"Cache-Control":"no-store"}});
  }catch{return fail("Unable to upload. Check Vercel Blob connection and storage limits.",503);}
}
