import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Sparkles, WandSparkles } from "lucide-react";
import Photo from "@/components/Photo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs, pageSeo, serviceSchema } from "@/lib/seo";
import { services } from "@/lib/site";

const path = "/party-makeup-nawada";
const title = "Party & Engagement Makeup Artist in Nawada, Bihar";
const description = "Party, engagement, reception and event makeup in Nawada, Bihar. View Sunidhi Artistry's occasion makeup options, prices and event date enquiry form.";
export const metadata:Metadata = pageSeo({path,title,description,image:"/images/real-party-1.webp"});
const eventServices = services.filter(s=>["Engagement Makeup","Reception Makeup","Party Makeup","Photoshoot Makeup","Event Makeup"].includes(s.name));
const questions = [
  { q:"What occasions can I enquire about?", a:"You can enquire about engagement ceremonies, receptions, sangeet, birthdays, festive events, photoshoots and other celebrations. Share the event so the artist can suggest a suitable look." },
  { q:"What is the price of party makeup in Nawada?", a:"The website currently lists Party Makeup at ₹4,500–₹8,000. Other occasion looks vary; check the displayed service prices and confirm your final quote with the studio." },
  { q:"Will my enquiry automatically reserve the event date?", a:"No. The studio checks the requested event date and confirms availability and any required advance payment before your appointment is accepted." }
];
export default function PartyMakeupNawada() {
  return <main className="local-landing">
    <JsonLd data={breadcrumbs([{name:"Home",path:"/"},{name:"Party & Engagement Makeup in Nawada",path}])}/>
    <JsonLd data={serviceSchema({name:"Party and Engagement Makeup in Nawada, Bihar",description,path})}/>
    <section className="page-banner centered"><span className="chip">OCCASION MAKEUP · NAWADA, BIHAR</span>
      <h1>Party &amp; Engagement Makeup in <em>Nawada</em></h1>
      <p>For celebrations that deserve a little extra glow: explore engagement, reception, party and photoshoot makeup looks created with your style and event in mind.</p>
      <div className="local-hero-actions"><Link href="/contact#book" className="pill">ENQUIRE ABOUT YOUR EVENT <ArrowUpRight size={16}/></Link><Link href="/portfolio" className="pill white">VIEW THE PORTFOLIO</Link></div>
    </section>
    <section className="wrap local-split section-space"><Photo name="real-party-1.webp" alt="Evening party makeup look from Sunidhi Artistry" className="local-main-image"/>
      <div><span className="chip">A LOOK FOR EVERY CELEBRATION</span><h2>Made for <em>your kind of moment.</em></h2>
        <p>From elegant engagement makeup to confident reception glam, the right look depends on your outfit, time of day and the feeling you want to create. Sunidhi Artistry offers personalised occasion makeup enquiries in Nawada, Bihar.</p>
        <p>Share your event date and any inspiration in the booking form. We can then discuss makeup style, pricing, hair styling options and whether an outstation appointment is possible.</p>
        <div className="local-points"><span><Sparkles size={17}/> Engagement and reception looks</span><span><Sparkles size={17}/> Party and festive makeup</span><span><Sparkles size={17}/> Photoshoot-friendly finishes</span><span><Sparkles size={17}/> Individual event date enquiries</span></div>
      </div></section>
    <section className="blush-block local-prices"><div className="wrap centered"><span className="chip">OCCASION SERVICES</span><h2>Choose your <em>celebration.</em></h2>
      <p>Indicative service pricing shown on the website. Please confirm dates, exact inclusions and a personalised quote.</p>
      <div className="price-grid">{eventServices.map(service=><Link className="price-card" href="/contact#book" key={service.name}><h3>{service.name}</h3><p>{service.desc}</p><strong>{service.price}</strong></Link>)}</div>
    </div></section>
    <section className="wrap local-steps section-space centered"><span className="chip">SIMPLE ENQUIRIES</span><h2>Plan your look in <em>three easy steps.</em></h2>
      <div className="local-step-grid"><article><CalendarDays/><h3>01. Choose your date</h3><p>Send your event date and whether you need engagement, reception or party makeup.</p></article>
        <article><WandSparkles/><h3>02. Discuss your style</h3><p>Share your outfit, timing, venue and makeup preferences so we can plan the right details.</p></article>
        <article><Sparkles/><h3>03. Confirm the details</h3><p>Availability, package choice, final charges and booking terms are agreed before confirmation.</p></article></div>
    </section>
    <section className="wrap local-faq section-space"><div className="centered"><span className="chip">YOUR QUESTIONS</span><h2>Everything you need <em>to know.</em></h2></div>
      <div className="faq-list">{questions.map(q=><details key={q.q}><summary>{q.q}<span>＋</span></summary><p>{q.a}</p></details>)}</div>
      <div className="local-related centered"><p>Getting married? Explore our <Link href="/bridal-makeup-nawada">bridal makeup guide for Nawada</Link>, or compare <Link href="/services">all services and bridal packages</Link>.</p>
      <Link href="/contact#book" className="pill">REQUEST YOUR EVENT DATE <ArrowUpRight size={15}/></Link></div>
    </section>
  </main>;
}
