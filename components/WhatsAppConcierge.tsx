"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Check, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { contact } from "@/lib/site";

const conversations = [
  { label: "Check bridal availability", text: "Hi Sunidhi! I'd love to check availability for bridal makeup. Can you help me with dates and packages?", icon: CalendarDays },
  { label: "Explore makeup packages", text: "Hello Sunidhi Artistry! Could you share your bridal and party makeup package details?", icon: Sparkles },
  { label: "Ask a quick question", text: "Hi Sunidhi! I found your website and have a question about your makeup services.", icon: MessageCircle }
] as const;

function WhatsAppMark({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M16 3.5C9.1 3.5 3.5 9.1 3.5 16c0 2.4.68 4.7 1.93 6.67L3.7 28.3l5.8-1.61A12.48 12.48 0 0 0 16 28.5c6.9 0 12.5-5.6 12.5-12.5S22.9 3.5 16 3.5Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"/>
    <path d="M10.5 10.8c-.38-.84-.8-.86-1.2-.87-.35 0-.75.02-1.15.44-.4.43-1.54 1.5-1.54 3.65s1.57 4.25 1.8 4.54c.22.28 3.03 4.86 7.46 6.62 3.68 1.46 4.43 1.17 5.23 1.1.79-.07 2.55-1.05 2.92-2.07.36-1.04.36-1.93.25-2.11-.11-.19-.4-.3-.84-.52-.44-.22-2.56-1.27-2.96-1.42-.4-.14-.69-.21-.97.22-.29.43-1.11 1.42-1.37 1.72-.25.28-.51.32-.95.1-.44-.22-1.88-.7-3.57-2.2-1.33-1.17-2.22-2.62-2.48-3.07-.25-.44-.03-.68.2-.9.2-.2.44-.51.66-.76.22-.25.29-.43.44-.73.15-.28.07-.54-.03-.76-.11-.21-.96-2.3-1.32-3.13Z" fill="currentColor" transform="translate(2 1) scale(.83)"/>
  </svg>;
}

export default function WhatsAppConcierge() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onPointer(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const whatsappLink = (text: string) => contact.whatsapp + "?text=" + encodeURIComponent(text);
  return <div className="wa-concierge" ref={rootRef}>
    {open && <aside className="wa-panel" id="sunidhi-whatsapp-panel" aria-label="WhatsApp enquiry options">
      <div className="wa-panel-head">
        <span className="wa-head-icon"><WhatsAppMark size={24}/></span>
        <div className="wa-head-copy"><strong>Sunidhi Artistry</strong><span><i aria-hidden="true"/> Let&apos;s talk about your special day</span></div>
        <button type="button" className="wa-close" onClick={() => { setOpen(false); triggerRef.current?.focus(); }} aria-label="Close WhatsApp options"><X size={19}/></button>
      </div>
      <div className="wa-panel-body">
        <span className="wa-eyebrow">YOUR BEAUTY CONCIERGE</span>
        <p>Hi, gorgeous! ✨ How can we help you today?</p>
        <div className="wa-options">
          {conversations.map(({ label, text, icon: Icon }) => <a key={label} href={whatsappLink(text)}
            target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <Icon size={17} aria-hidden="true"/><span>{label}</span><ArrowUpRight size={15} aria-hidden="true"/>
          </a>)}
        </div>
        <Link href="/contact#book" onClick={() => setOpen(false)} className="wa-form-link"><Send size={15}/> Prefer a booking form? <span>Start here ↗</span></Link>
      </div>
      <p className="wa-foot"><Check size={13}/> Opens WhatsApp in a new tab. No messages are sent automatically.</p>
    </aside>}
    <button ref={triggerRef} type="button" className={"wa-launcher" + (open ? " is-open" : "")}
      aria-expanded={open} aria-controls="sunidhi-whatsapp-panel" aria-label={open ? "Close WhatsApp chat options" : "Open WhatsApp chat options"}
      onClick={() => setOpen(value => !value)}>
      <span className="wa-launch-icon">{open ? <X size={23}/> : <WhatsAppMark size={24}/>}</span>
      <span className="wa-launch-copy"><strong>Chat with us</strong><small>Usually responds personally</small></span>
      <span className="wa-online" aria-hidden="true"/>
    </button>
  </div>;
}
