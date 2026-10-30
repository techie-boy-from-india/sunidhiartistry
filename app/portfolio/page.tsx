import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PortfolioGallery from "@/components/PortfolioGallery";
import { breadcrumbs, pageSeo } from "@/lib/seo";

export const metadata:Metadata = pageSeo({
  path:"/portfolio",
  title:"Bridal & Party Makeup Portfolio in Nawada, Bihar",
  description:"Explore real bridal, engagement, reception and party makeup photographs from Sunidhi Artistry, makeup artist in Nawada, Bihar. Enquire about your date.",
  image:"/images/real-bridal-4.webp"
});
export default function Portfolio() {
  return <main>
    <JsonLd data={breadcrumbs([{name:"Home",path:"/"},{name:"Makeup Portfolio",path:"/portfolio"}])}/>
    <section className="page-banner centered"><span className="chip">REAL BRIDAL & OCCASION LOOKS</span>
      <h1>Makeup Portfolio from <em>Nawada, Bihar</em></h1>
      <p>Explore real bridal, engagement and party makeup looks by Sunidhi Artistry. Find inspiration for your wedding, celebration or next special event.</p>
    </section>
    <PortfolioGallery/>
    <section className="centered section-space blush-block"><span className="chip">YOUR SPECIAL DAY</span>
      <h2>Inspired by a <em>particular look?</em></h2>
      <p>Tell us your favourite style and event date. Explore <Link href="/bridal-makeup-nawada">bridal makeup in Nawada</Link> or send a direct booking request.</p>
      <Link href="/contact#book" className="pill">ENQUIRE ABOUT YOUR DATE ↗</Link>
    </section>
  </main>;
}
