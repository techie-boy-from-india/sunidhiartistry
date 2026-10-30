import { db } from "@/lib/db";
import { contact, services, packages, photos } from "@/lib/site";

export type CmsSettings = { phone:string;whatsapp:string;email:string;instagramHandle:string;instagram:string;city:string };
export type CmsCopy = {heroTitle:string;heroAccent:string;heroDescription:string;aboutHeading:string;aboutDescription:string;experienceClaim:string;bridalClaim:string};
export type CmsService={name:string;price:string;desc:string;image:string;category:string;active:boolean};
export type CmsPackage={name:string;sub:string;price:string;items:string[];active:boolean};
export type CmsPhoto={src:string;category:string;alt:string;active:boolean};
export type CmsTestimonial={name:string;quote:string;context:string;active:boolean};
export type CmsSection="settings"|"copy"|"services"|"packages"|"gallery"|"testimonials";
export type CmsData={
  settings:CmsSettings;copy:CmsCopy;services:CmsService[];
  packages:CmsPackage[];gallery:CmsPhoto[];testimonials:CmsTestimonial[];
};
export const copyDefaults:CmsCopy={
  heroTitle:"Where Every Bride",heroAccent:"Glows Differently.",
  heroDescription:"Sunidhi Artistry creates elegant, personalised makeup looks for brides, parties and events across Bihar — with premium products and a soft, feminine touch.",
  aboutHeading:"Hi, I’m Sunidhi — and I believe every face has its own poetry.",
  aboutDescription:"A professional makeup artist specialising in bridal, party and event makeup. I create elegant, personalised looks that enhance natural beauty and confidence.",
  experienceClaim:"5+ Years’ Experience",bridalClaim:"500+ Happy Brides*"
};
export const cmsDefaults:CmsData={
  settings:{...contact},copy:copyDefaults,
  services:services.map(x=>({...x,active:true})),
  packages:packages.map(x=>({...x,items:[...x.items],active:true})),
  gallery:photos.map(x=>({...x,active:true})),testimonials:[]
};
export type CmsVersions = Record<CmsSection,number>;
export async function getCms():Promise<{data:CmsData;versions:CmsVersions;ready:boolean}> {
  const result:{data:CmsData;versions:CmsVersions;ready:boolean}={
    data:structuredClone(cmsDefaults),
    versions:{settings:0,copy:0,services:0,packages:0,gallery:0,testimonials:0},ready:false
  };
  try {
    const rows=await db()<{section:CmsSection;value:unknown;revision:number}[]>`
      SELECT section,value,revision FROM cms_sections
    `;
    if(rows.length!==6) return result;
    for(const row of rows){
      // DB values are validated on write by the admin API.
      (result.data as Record<CmsSection,unknown>)[row.section]=row.value;
      result.versions[row.section]=row.revision;
    }
    result.ready=true;
  } catch { /* CMS hasn't been migrated yet: keep the existing live website. */ }
  return result;
}
export function visibleCms(data:CmsData) {
  return {
    services:data.services.filter(s=>s.active),
    packages:data.packages.filter(p=>p.active),
    gallery:data.gallery.filter(p=>p.active),
    testimonials:data.testimonials.filter(t=>t.active)
  };
}
