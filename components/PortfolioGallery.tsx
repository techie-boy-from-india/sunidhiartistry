"use client";
import { useState } from "react";
import Photo from "@/components/Photo";
import type { CmsPhoto } from "@/lib/cms";
const categories=["All","Bridal","Engagement","Reception","Party","Event"];
export default function PortfolioGallery({photos}:{photos:CmsPhoto[]}){
  const [filter,setFilter]=useState("All");
  const shown=filter==="All"?photos:photos.filter(p=>p.category===filter);
  return <section className="wrap section-space">
    <div className="filters" role="group" aria-label="Filter portfolio">
      {categories.map(c=><button key={c} type="button" onClick={()=>setFilter(c)}
        aria-pressed={filter===c} className={filter===c?"active":""}>{c}</button>)}
    </div>
    <div className="portfolio-grid">
      {shown.map(p=><div className="portfolio-item" key={p.src}>
        <Photo name={p.src} alt={p.alt}/><span>{p.category}</span>
      </div>)}
    </div>
    {shown.length===0&&<p className="centered">New portfolio images coming soon.</p>}
  </section>;
}
