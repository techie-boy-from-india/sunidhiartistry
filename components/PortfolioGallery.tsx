"use client";
import { useState } from "react";
import Photo from "@/components/Photo";
import { photos } from "@/lib/site";

const categories = ["All","Bridal","Engagement","Reception","Party","Event"] as const;
export default function PortfolioGallery() {
  const [filter,setFilter] = useState<string>("All");
  const showing = filter === "All" ? photos : photos.filter(photo=>photo.category===filter);
  return <section className="wrap section-space">
    <div className="filters" role="group" aria-label="Filter makeup portfolio">
      {categories.map(category=><button key={category} type="button" onClick={()=>setFilter(category)}
        aria-pressed={filter===category} className={filter===category?"active":""}>{category}</button>)}
    </div>
    <div className="portfolio-grid">{showing.map(photo=><div className="portfolio-item" key={photo.src}>
      <Photo name={photo.src} alt={photo.alt}/><span>{photo.category}</span>
    </div>)}</div>
  </section>;
}
