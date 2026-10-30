import type { MetadataRoute } from "next";
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.NEXT_PUBLIC_SITE_URL||"https://sunidhiartistry-38na.vercel.app";return ["/","/services","/portfolio","/about","/contact"].map((p,i)=>({url:base+p,lastModified:new Date(),changeFrequency:"monthly" as const,priority:i===0?1:0.7}));}
