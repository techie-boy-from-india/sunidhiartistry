import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, CheckCircle2, Heart, Sparkles } from "lucide-react";
import Photo from "@/components/Photo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs, pageSeo, serviceSchema } from "@/lib/seo";
import { packages } from "@/lib/site";

const path = "/bridal-makeup-nawada";
const title = "Bridal Makeup Artist in Nawada, Bihar";
const description = "Bridal makeup in Nawada, Bihar by Sunidhi Artistry. Explore HD bridal looks, airbrush package options, draping, trials and wedding-day booking enquiries.";
export const metadata: Metadata = pageSeo({ path, title, description, image:"/images/real-bridal-1.webp" });

const questions = [
  { q:"How can I book bridal makeup in Nawada?", a:"Send your wedding date, venue and contact details through the booking form. Sunidhi Artistry will check availability and discuss the look before confirming your slot." },
  { q:"Do you offer HD or airbrush bridal makeup?", a:"The Silver bridal package lists an HD makeup finish. The Premium package lists an airbrush HD finish. Please confirm the exact package inclusions and suitability during consultation." },
  { q:"Is a makeup trial included?", a:"The Gold package lists a pre-wedding trial. Ask about trial availability for other packages when enquiring." },
  { q:"Can the artist travel for a wedding outside Nawada?", a:"Outstation appointments may be available on request. Share your location and event schedule so travel feasibility and charges can be discussed." }
];

export default function BridalMakeupNawada() {
  return <main className="local-landing">
    <JsonLd data={breadcrumbs([{name:"Home",path:"/"},{name:"Bridal Makeup in Nawada",path}])}/>
    <JsonLd data={serviceSchema({name:"Bridal Makeup in Nawada, Bihar",description,path})}/>
    <section className="page-banner centered"><span className="chip">BRIDAL MAKEUP · NAWADA, BIHAR</span>
      <h1>Bridal Makeup Artist in <em>Nawada, Bihar</em></h1>
      <p>For your wedding day, choose a look that feels like you — from graceful HD bridal makeup to a personalised consultation about your dress, skin and celebration.</p>
      <div className="local-hero-actions"><Link className="pill" href="/contact#book">REQUEST YOUR WEDDING DATE <ArrowUpRight size={16}/></Link>
        <Link className="pill white" href="/portfolio">VIEW REAL BRIDAL LOOKS</Link></div>
    </section>
    <section className="wrap local-split section-space">
      <Photo name="real-bridal-1.webp" alt="Traditional bridal makeup with detailed jewellery by Sunidhi Artistry" className="local-main-image"/>
      <div><span className="chip">WEDDING BEAUTY, PERSONALISED</span>
        <h2>Your bridal look, <em>thoughtfully created.</em></h2>
        <p>Planning bridal makeup in Nawada starts with the details that matter to you: your outfit, jewellery, venue, comfort and the finish you prefer. Sunidhi Artistry offers bridal looks designed around each bride rather than one fixed style.</p>
        <p>Whether you want a soft bridal glow or a more defined evening finish, describe your wedding plans when you enquire. Availability, final pricing, travel and the package inclusions are confirmed before a booking is accepted.</p>
        <div className="local-points"><span><CheckCircle2 size={17}/> Bridal HD makeup options</span><span><CheckCircle2 size={17}/> Hair styling and outfit draping</span><span><CheckCircle2 size={17}/> Trial options in selected packages</span><span><CheckCircle2 size={17}/> Outstation wedding enquiries welcome</span></div>
      </div>
    </section>
    <section className="blush-block local-prices"><div className="wrap centered">
      <span className="chip">BRIDAL PACKAGES</span><h2>Find your <em>bridal experience.</em></h2>
      <p>Indicative package details currently shown by the studio. Your final quotation depends on the services and arrangements discussed.</p>
      <div className="package-grid">{packages.map((pkg,index)=><article key={pkg.name} className={"package-card "+(index===1?"popular":"")}>
        <Heart size={22}/><h3>{pkg.name}</h3><span>{pkg.sub}</span><div className="package-price">{pkg.price}</div>
        <ul>{pkg.items.map(item=><li key={item}>✓ {item}</li>)}</ul>
        <Link className="pill" href="/contact#book">ENQUIRE ABOUT {pkg.name.toUpperCase()} <ArrowUpRight size={14}/></Link>
      </article>)}</div>
    </div></section>
    <section className="wrap local-steps section-space centered">
      <span className="chip">THE BOOKING PROCESS</span><h2>From enquiry to <em>your big day.</em></h2>
      <div className="local-step-grid"><article><CalendarDays/><h3>01. Share your date</h3><p>Tell us your wedding date, preferred service, venue and a little about the look you have in mind.</p></article>
        <article><Sparkles/><h3>02. Plan your look</h3><p>Discuss availability, makeup finish, trial options, package inclusions and any travel arrangements.</p></article>
        <article><CheckCircle2/><h3>03. Confirm your booking</h3><p>Your request becomes a confirmed appointment only after the studio verifies availability and booking terms.</p></article></div>
    </section>
    <section className="wrap local-faq section-space"><div className="centered"><span className="chip">BRIDAL MAKEUP FAQs</span><h2>Questions before <em>the wedding?</em></h2></div>
      <div className="faq-list">{questions.map(row=><details key={row.q}><summary>{row.q}<span>＋</span></summary><p>{row.a}</p></details>)}</div>
      <div className="local-related centered"><p>Exploring engagement, reception or party looks too? Browse <Link href="/services">all makeup services in Nawada</Link> or visit our <Link href="/party-makeup-nawada">party makeup guide</Link>.</p>
        <Link href="/contact#book" className="pill">ASK ABOUT YOUR WEDDING DATE <ArrowUpRight size={15}/></Link></div>
    </section>
  </main>;
}
