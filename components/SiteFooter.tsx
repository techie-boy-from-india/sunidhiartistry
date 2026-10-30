import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Heart, Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import { contact } from "@/lib/site";

export default function SiteFooter() {
  return <footer className="footer lux-footer">
    <div className="lux-footer-glow" aria-hidden="true"/>
    <div className="wrap lux-footer-hero">
      <div><span className="lux-eyebrow lux-eyebrow-light">YOUR MOMENT. OUR ARTISTRY.</span>
        <h2>Every beautiful story<br/>begins with <em>a hello.</em></h2>
      </div>
      <Link href="/contact#book" className="lux-footer-cta">Let&apos;s plan your look <ArrowUpRight size={20}/></Link>
    </div>
    <div className="wrap lux-footer-rule"/>
    <div className="wrap lux-footer-grid">
      <div className="lux-footer-about">
        <Link href="/" className="lux-footer-brand"><Image src="/images/sunidhi-logo.webp" width={48} height={48} alt=""/> Sunidhi Artistry</Link>
        <p>Modern bridal beauty with a personal touch. Thoughtfully crafted looks for the moments you never want to forget.</p>
        <span className="lux-footer-signature">Made with love in Bihar ♡</span>
      </div>
      <div><h3>EXPLORE</h3><Link href="/">Home</Link><Link href="/services">Services & pricing</Link><Link href="/portfolio">Our work</Link><Link href="/about">Meet the artist</Link></div>
      <div><h3>GET IN TOUCH</h3><a href={"mailto:" + contact.email}><Mail size={15}/>{contact.email}</a>
        <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={15}/>{contact.phone}</a>
        <span className="lux-footer-address"><MapPin size={15}/>{contact.city}</span></div>
      <div><h3>FOLLOW ALONG</h3><a href={contact.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={17}/> Instagram <ArrowUpRight size={14}/></a>
        <p>Real faces. Beautiful details. A little everyday magic.</p></div>
    </div>
    <div className="wrap lux-footer-bottom"><span>© {new Date().getFullYear()} Sunidhi Artistry. All rights reserved.</span>
      <span>Crafted for beautiful moments <Heart size={13} fill="currentColor" aria-hidden="true"/></span></div>
  </footer>;
}
