"use client";
import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { Camera, CircleCheck, Eye, FilePenLine, ImagePlus, Package, Plus, RefreshCw, Save, Settings2, Star, Trash2 } from "lucide-react";
import Photo from "@/components/Photo";
import type { CmsData,CmsSection,CmsService,CmsPackage,CmsPhoto,CmsTestimonial,CmsVersions } from "@/lib/cms";

const sections:{id:CmsSection;name:string;icon:typeof Camera}[]=[
  {id:"copy",name:"Website Text",icon:FilePenLine},
  {id:"services",name:"Services & Pricing",icon:Package},
  {id:"packages",name:"Bridal Packages",icon:Package},
  {id:"gallery",name:"Portfolio Photos",icon:Camera},
  {id:"testimonials",name:"Testimonials",icon:Star},
  {id:"settings",name:"Contact & Socials",icon:Settings2}
];
const categories=["Bridal","Engagement","Reception","Party","Event"];
type Field<K extends CmsSection>=CmsData[K];
const imageSrc=(src:string)=>src.startsWith("https://")?src:"/images/"+src;
function TextInput({title,value,onChange,multiline=false,required=true}:{
  title:string;value:string;onChange:(v:string)=>void;multiline?:boolean;required?:boolean
}) {
  return <label className="cms-field"><span>{title}</span>{multiline?
    <textarea maxLength={2000} rows={3} value={value} onChange={e=>onChange(e.target.value)} required={required}/>:
    <input maxLength={250} value={value} onChange={e=>onChange(e.target.value)} required={required}/>}</label>;
}
function Visible({active,onChange}:{active:boolean;onChange:(v:boolean)=>void}){
  return <label className="cms-check"><input type="checkbox" checked={active} onChange={e=>onChange(e.target.checked)}/>
    {active?"Published":"Hidden (not shown publicly)"}</label>;
}
export default function CmsEditor({initial,versions,ready}:{initial:CmsData;versions:CmsVersions;ready:boolean}) {
  const [data,setData]=useState<CmsData>(structuredClone(initial));
  const [revisions,setRevisions]=useState<CmsVersions>({...versions});
  const [part,setPart]=useState<CmsSection>("copy");
  const [dirty,setDirty]=useState<Record<CmsSection,boolean>>({
    settings:false,copy:false,services:false,packages:false,gallery:false,testimonials:false
  });
  const [saving,setSaving]=useState(false);
  const [uploading,setUploading]=useState(false);
  const [notice,setNotice]=useState("");
  const [failed,setFailed]=useState(false);
  const change=<K extends CmsSection>(section:K,value:Field<K>)=>{
    setData(old=>({...old,[section]:value}));
    setDirty(old=>({...old,[section]:true}));
  };
  const changeItem=<K extends "services"|"packages"|"gallery"|"testimonials">(
    section:K,index:number,row:CmsData[K][number]
  )=>{
    const next=[...data[section]] as Array<CmsData[K][number]>;
    next[index]=row;
    change(section,next as Field<K>);
  };
  const dropItem=<K extends "services"|"packages"|"gallery"|"testimonials">(section:K,index:number)=>{
    if(!window.confirm("Remove this entry from the public list? Existing booking records will remain unchanged."))return;
    change(section,data[section].filter((_,i)=>i!==index) as Field<K>);
  };
  async function save(section:CmsSection) {
    setSaving(true);setFailed(false);setNotice("");
    try {
      const response=await fetch("/api/admin/cms/"+section,{
        method:"PATCH",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({value:data[section],revision:revisions[section]})
      });
      const payload=await response.json();
      if(!response.ok)throw new Error(payload.error||"Could not save");
      setRevisions(prev=>({...prev,[section]:payload.revision}));
      setDirty(prev=>({...prev,[section]:false}));
      setNotice("Published! The public website now uses these updates without a new GitHub deployment.");
    }catch(e){setFailed(true);setNotice(e instanceof Error?e.message:"Save failed");}
    finally{setSaving(false);}
  }
  async function upload(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];
    if(!file)return;
    setNotice("");setFailed(false);
    if(file.size>3*1024*1024){setFailed(true);setNotice("Please choose a compressed JPG, PNG or WebP under 3 MB.");return;}
    setUploading(true);
    try {
      const form=new FormData();form.set("image",file);
      const response=await fetch("/api/admin/cms/upload",{method:"POST",body:form});
      const output=await response.json();
      if(!response.ok)throw new Error(output.error||"Upload failed");
      change("gallery",[...data.gallery,{src:output.url,alt:file.name.replace(/\.[^.]+$/,"").replace(/[-_]/g," "),category:"Bridal",active:true}]);
      setNotice("Image uploaded. Review its alt text and click Publish Changes to add it to the live portfolio.");
    }catch(e){setFailed(true);setNotice(e instanceof Error?e.message:"Upload failed");}
    finally{setUploading(false);event.target.value="";}
  }
  const button= <div className="cms-savebar">
    <div><strong>{sections.find(s=>s.id===part)?.name}</strong>
      <small>{dirty[part]?"You have unpublished changes":"All edits for this section are published"}</small></div>
    <button className="cms-save-button" disabled={!ready||!dirty[part]||saving||uploading} onClick={()=>save(part)}><Save size={17}/>{saving?"Saving…":"Publish Changes"}</button>
  </div>;
  return <section className="cms-workspace">
    <div className="cms-heading"><div><span className="admin-panel-subtitle">THE CONTENT STUDIO</span><h2>Make your website yours.</h2><p>Update photos, services and business details directly from the dashboard. Preview the edits before you publish.</p></div>
      <Link href="/" className="cms-site-link" target="_blank" rel="noopener noreferrer"><Eye size={16}/> View live site ↗</Link></div>
    {!ready&&<div className="admin-alert" role="alert">CMS isn't activated yet. Back up Neon and execute the complete <strong>db/006_cms.sql</strong> migration first. The existing website remains unchanged.</div>}
    {notice&&<div className={failed?"admin-alert":"admin-toast"} role="status">{notice}</div>}
    <div className="cms-layout">
      <aside className="cms-nav">{sections.map(s=><button type="button" key={s.id}
        className={part===s.id?"selected":""} onClick={()=>{setPart(s.id);setNotice("");}}>
        <s.icon size={17}/>{s.name}{dirty[s.id]&&<span className="cms-dirty-dot" aria-label="Unpublished changes"/>}</button>)}
        <small>Changes are stored in Neon. Publishing immediately updates the public website.</small>
      </aside>
      <div className="cms-editors">
        <div className="admin-panel cms-card">
          {part==="copy"&&<div className="cms-grid">
            <TextInput title="Main hero headline" value={data.copy.heroTitle} onChange={v=>change("copy",{...data.copy,heroTitle:v})}/>
            <TextInput title="Hero highlighted text" value={data.copy.heroAccent} onChange={v=>change("copy",{...data.copy,heroAccent:v})}/>
            <TextInput multiline title="Hero description" value={data.copy.heroDescription} onChange={v=>change("copy",{...data.copy,heroDescription:v})}/>
            <TextInput title="About intro headline" value={data.copy.aboutHeading} onChange={v=>change("copy",{...data.copy,aboutHeading:v})}/>
            <TextInput title="About description" multiline value={data.copy.aboutDescription} onChange={v=>change("copy",{...data.copy,aboutDescription:v})}/>
            <TextInput title="Experience claim (verify with owner)" value={data.copy.experienceClaim} onChange={v=>change("copy",{...data.copy,experienceClaim:v})}/>
            <TextInput title="Bridal count claim (verify with owner)" value={data.copy.bridalClaim} onChange={v=>change("copy",{...data.copy,bridalClaim:v})}/>
            <div className="cms-preview"><span><Eye size={15}/> Live draft preview</span>
              <h3>{data.copy.heroTitle}<br/><em>{data.copy.heroAccent}</em></h3><p>{data.copy.heroDescription}</p></div>
          </div>}
          {part==="settings"&&<div className="cms-grid">
            <TextInput title="Business phone" value={data.settings.phone} onChange={v=>change("settings",{...data.settings,phone:v})}/>
            <TextInput title="WhatsApp URL (https://wa.me/...)" value={data.settings.whatsapp} onChange={v=>change("settings",{...data.settings,whatsapp:v})}/>
            <TextInput title="Business email" value={data.settings.email} onChange={v=>change("settings",{...data.settings,email:v})}/>
            <TextInput title="Instagram username" value={data.settings.instagramHandle} onChange={v=>change("settings",{...data.settings,instagramHandle:v})}/>
            <TextInput title="Instagram profile URL" value={data.settings.instagram} onChange={v=>change("settings",{...data.settings,instagram:v})}/>
            <TextInput title="Studio city & location" value={data.settings.city} onChange={v=>change("settings",{...data.settings,city:v})}/>
          </div>}
          {part==="services"&&<div className="cms-item-stack">
            {data.services.map((s,i)=><div className="cms-edit-item" key={i}>
              <div className="cms-item-top"><strong>Service {i+1}</strong><button type="button" className="cms-danger" onClick={()=>dropItem("services",i)}><Trash2 size={15}/> Remove</button></div>
              <div className="cms-grid two">
                <TextInput title="Service name" value={s.name} onChange={v=>changeItem("services",i,{...s,name:v})}/>
                <TextInput title="Displayed price / range" value={s.price} onChange={v=>changeItem("services",i,{...s,price:v})}/>
              </div>
              <TextInput title="Description" multiline value={s.desc} onChange={v=>changeItem("services",i,{...s,desc:v})}/>
              <div className="cms-grid two"><label className="cms-field"><span>Category</span><select value={s.category} onChange={e=>changeItem("services",i,{...s,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
                <label className="cms-field"><span>Service photo</span><select value={s.image} onChange={e=>changeItem("services",i,{...s,image:e.target.value})}>
                  {!data.gallery.some(g=>g.src===s.image)&&<option value={s.image}>{s.image}</option>}
                  {data.gallery.map(g=><option key={g.src} value={g.src}>{g.alt.slice(0,40)}</option>)}</select></label></div>
              <Visible active={s.active} onChange={v=>changeItem("services",i,{...s,active:v})}/>
            </div>)}
            <button type="button" className="cms-add" onClick={()=>change("services",[...data.services,{name:"New Makeup Service",price:"Price on request",desc:"Describe your service.",image:data.gallery[0]?.src||"real-bridal-1.webp",category:"Bridal",active:false}])}><Plus size={16}/> Add Service</button>
          </div>}
          {part==="packages"&&<div className="cms-item-stack">
            {data.packages.map((pkg,i)=><div className="cms-edit-item" key={i}>
              <div className="cms-item-top"><strong>Package {i+1}</strong><button className="cms-danger" type="button" onClick={()=>dropItem("packages",i)}><Trash2 size={15}/> Remove</button></div>
              <div className="cms-grid two">
                <TextInput title="Package name" value={pkg.name} onChange={v=>changeItem("packages",i,{...pkg,name:v})}/>
                <TextInput title="Price / range" value={pkg.price} onChange={v=>changeItem("packages",i,{...pkg,price:v})}/>
              </div>
              <TextInput title="Subtitle" value={pkg.sub} onChange={v=>changeItem("packages",i,{...pkg,sub:v})}/>
              <label className="cms-field"><span>Included items (one per line)</span><textarea rows={5} value={pkg.items.join("\n")} onChange={e=>changeItem("packages",i,{...pkg,items:e.target.value.split("\n").map(v=>v.trim()).filter(Boolean)})}/></label>
              <Visible active={pkg.active} onChange={v=>changeItem("packages",i,{...pkg,active:v})}/>
            </div>)}
            <button className="cms-add" type="button" onClick={()=>change("packages",[...data.packages,{name:"New Package",sub:"New bridal experience",price:"On request",items:["Hair & Makeup"],active:false}])}><Plus size={16}/> Add Package</button>
          </div>}
          {part==="gallery"&&<div className="cms-item-stack">
            <label className="cms-upload"><ImagePlus size={25}/><strong>{uploading?"Uploading…":"Upload a new portfolio photograph"}</strong>
              <small>JPG, PNG or WebP · maximum 3 MB · client-approved photos only</small>
              <input type="file" accept="image/jpeg,image/png,image/webp" disabled={!ready||uploading} onChange={upload}/></label>
            <p className="cms-tip">Images upload to Vercel Blob. Click Publish Changes after editing its details. Removing a photo hides it from the portfolio but does not delete the original storage file.</p>
            <div className="cms-gallery-list">{data.gallery.map((g,i)=><div className="cms-photo-editor" key={i}>
              <div className="cms-thumb"><Photo name={g.src} alt={g.alt}/></div>
              <div className="cms-photo-fields"><TextInput title="Accessible photo description" value={g.alt} onChange={v=>changeItem("gallery",i,{...g,alt:v})}/>
                <label className="cms-field"><span>Category</span><select value={g.category} onChange={e=>changeItem("gallery",i,{...g,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
                <Visible active={g.active} onChange={v=>changeItem("gallery",i,{...g,active:v})}/>
                <button className="cms-danger" type="button" onClick={()=>dropItem("gallery",i)}><Trash2 size={14}/> Remove from gallery</button>
              </div>
            </div>)}</div>
          </div>}
          {part==="testimonials"&&<div className="cms-item-stack">
            <p className="cms-tip">Only publish genuine testimonials with the customer's permission. They're hidden until marked Published.</p>
            {data.testimonials.map((t,i)=><div className="cms-edit-item" key={i}>
              <div className="cms-item-top"><strong>Review {i+1}</strong><button className="cms-danger" onClick={()=>dropItem("testimonials",i)} type="button"><Trash2 size={15}/> Remove</button></div>
              <TextInput title="Client display name" value={t.name} onChange={v=>changeItem("testimonials",i,{...t,name:v})}/>
              <TextInput title="Customer's original review" multiline value={t.quote} onChange={v=>changeItem("testimonials",i,{...t,quote:v})}/>
              <TextInput title="Context (e.g. Bridal Makeup)" value={t.context} onChange={v=>changeItem("testimonials",i,{...t,context:v})}/>
              <Visible active={t.active} onChange={v=>changeItem("testimonials",i,{...t,active:v})}/>
            </div>)}
            <button className="cms-add" type="button" onClick={()=>change("testimonials",[...data.testimonials,{name:"Client Name",quote:"Paste a real review from a consenting client.",context:"Bridal Makeup",active:false}])}><Plus size={16}/> Add Testimonial</button>
          </div>}
        </div>
        {button}
        <p className="cms-footer-note"><CircleCheck size={15}/> Publishing edits the live website instantly. To see saved changes, open the public page and refresh it. Booking history and payments are stored separately.</p>
      </div>
    </div>
  </section>;
}
