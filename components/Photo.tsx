"use client";
import Image from "next/image";
import { useState } from "react";
export default function Photo({name,alt,className="",priority=false}:{name:string;alt:string;className?:string;priority?:boolean}){const [failed,setFailed]=useState(false);const isRemote=name.startsWith("https://");return <div className={"photo-frame "+className}>{!failed?<Image src={isRemote?name:"/images/"+name} alt={alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1050px) 50vw, 33vw" priority={priority} unoptimized={isRemote} onError={()=>setFailed(true)}/>:<div className="photo-missing" aria-label={alt}><span>Sunidhi Artistry</span><small>Portfolio photo being prepared</small></div>}</div>}
