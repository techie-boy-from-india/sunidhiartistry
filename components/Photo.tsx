"use client";
import Image from "next/image";
import { useState } from "react";

export default function Photo({name,alt,className="",priority=false}:{name:string;alt:string;className?:string;priority?:boolean}) {
  const [failed,setFailed]=useState(false);
  return <div className={"photo-frame "+className}>
    {!failed ? <Image src={"/images/"+name} alt={alt} fill
      sizes={priority ? "(max-width: 800px) 95vw, 42vw" : "(max-width: 640px) 93vw, (max-width: 1100px) 50vw, 33vw"}
      priority={priority} onError={()=>setFailed(true)}/> :
      <div className="photo-missing" aria-label={alt}><span>Sunidhi Artistry</span><small>Portfolio photo being prepared</small></div>}
  </div>;
}
