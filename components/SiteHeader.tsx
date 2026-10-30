import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CalendarDays, Instagram, Menu, Sparkles } from "lucide-react";
import { contact } from "@/lib/site";

const links = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Portfolio", "/portfolio"],
  ["The Artist", "/about"],
  ["Contact", "/contact"]
] as const;

export default function SiteHeader() {
  return <header className="site-header lux-header">
    <div className="lux-announcement"><div className="wrap lux-announcement-inner">
      <span><Sparkles size={12} aria-hidden="true"/> BRIDAL ARTISTRY, THOUGHTFULLY MADE</span>
      <a href={contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Sunidhi Artistry on Instagram"><Instagram size={13}/> FOLLOW OUR BEAUTY DIARY <ArrowUpRight size={12}/></a>
    </div></div>
    <div className="wrap lux-header-glass">
      <Link className="lux-brand" href="/" aria-label="Sunidhi Artistry home">
        <span className="lux-brand-logo"><Image src="/images/sunidhi-logo.webp" alt="" width={45} height={45}/></span>
        <span className="lux-brand-type"><strong>Sunidhi <em>Artistry</em></strong><small>BRIDAL & OCCASION MAKEUP</small></span>
      </Link>
      <nav className="lux-nav" aria-label="Main menu">
        {links.map(([name, path]) => <Link href={path} key={path}>{name}</Link>)}
      </nav>
      <Link href="/contact#book" className="lux-header-book">Reserve a date <ArrowUpRight size={17} aria-hidden="true"/></Link>
      <details className="lux-mobile-nav">
        <summary aria-label="Open website menu"><Menu size={23}/><span>MENU</span></summary>
        <nav aria-label="Mobile menu">
          {links.map(([name, path]) => <Link key={path} href={path}>{name}<ArrowUpRight size={15}/></Link>)}
          <Link href="/contact#book" className="lux-mobile-book"><CalendarDays size={16}/> Request your date</Link>
        </nav>
      </details>
    </div>
  </header>;
}
