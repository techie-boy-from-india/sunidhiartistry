"use client";

import { useState, type FormEvent } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, CheckCircle2, Heart, Instagram, Menu, Sparkles, X } from "lucide-react";

const services = [
 { id: "01", title: "Bridal Makeup", description: "A timeless look that celebrates you, through every happy tear and every unforgettable moment.", image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1100&q=85&auto=format&fit=crop", tag: "THE SIGNATURE" },
 { id: "02", title: "Engagement Makeup", description: "Soft radiance, romantic details, and a glow made for your once-in-a-lifetime yes.", image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1100&q=85&auto=format&fit=crop", tag: "THE ROMANTIC" },
 { id: "03", title: "Party Makeup", description: "Effortlessly striking beauty for your most memorable celebrations.", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1100&q=85&auto=format&fit=crop", tag: "THE MOMENT" },
];
const imageNotes = "Editorial placeholder photograph. Replace with approved Sunidhi Artistry portfolio imagery before publication.";
export default function Home() {
 const [menu, setMenu] = useState(false);
 const [busy, setBusy] = useState(false);
 const [feedback, setFeedback] = useState("");
 const [success, setSuccess] = useState(false);
 async function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const form = event.currentTarget;
  setBusy(true); setFeedback(""); setSuccess(false);
  const values = new FormData(form);
  try {
   const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
    name: values.get("name"), email: values.get("email"), phone: values.get("phone"), service: values.get("service"), eventDate: values.get("eventDate"), message: values.get("message"), website: values.get("website")
   }) });
   const data = await response.json();
   if (!response.ok) throw new Error(data.error || "Please try again.");
   setSuccess(true);
   setFeedback("Your enquiry was received. This is not yet a confirmed booking; we will be in touch.");
   form.reset();
  } catch (error) { setFeedback(error instanceof Error ? error.message : "Unable to send your enquiry."); }
  finally { setBusy(false); }
 }
 return <main>
  <div className="announcement">A LITTLE MAGIC FOR YOUR MOST BEAUTIFUL MOMENTS <span>✦</span> ENQUIRIES OPEN</div>
  <header className="header"><a className="brand" href="#home" aria-label="Sunidhi Artistry home">sunidhi <em>artistry.</em><small>THE ART OF FEELING BEAUTIFUL</small></a>
   <nav className={menu ? "nav open" : "nav"} aria-label="Main navigation"><a href="#story" onClick={()=>setMenu(false)}>Our Story</a><a href="#services" onClick={()=>setMenu(false)}>Services</a><a href="#gallery" onClick={()=>setMenu(false)}>The Edit</a><a href="#contact" onClick={()=>setMenu(false)}>Contact</a><a className="nav-cta" href="#book" onClick={()=>setMenu(false)}>BOOK YOUR DATE <ArrowUpRight size={15}/></a></nav>
   <button className="mobile-menu" onClick={()=>setMenu(!menu)} aria-label={menu ? "Close menu" : "Open menu"}>{menu ? <X/> : <Menu/>}</button></header>
  <section id="home" className="hero">
   <div className="hero-text"><div className="eyebrow"><span className="eyebrow-line"/> MAKEUP ARTISTRY, WITH HEART</div><h1>Every face<br/>has <em>a story.</em><br/>Let yours <i>glow.</i></h1><p>For the moments you&apos;ll remember forever. Elevated, effortless makeup that feels beautifully, unmistakably you.</p><a href="#book" className="button dark">LET&apos;S MAKE MAGIC <ArrowUpRight size={17}/></a><a href="#services" className="text-link">EXPLORE SERVICES <ArrowDown size={14}/></a><div className="hero-foot"><span>✦ &nbsp; BRIDAL & OCCASION MAKEUP</span><span>01 / 03</span></div></div>
   <div className="hero-art"><div className="hero-photo" role="img" aria-label="Editorial image of a bride"><span className="image-note" title={imageNotes}>REFERENCE IMAGE</span></div><span className="hero-stamp">BEAUTY<br/>IN EVERY<br/><em>detail.</em> ✳</span></div>
  </section>
  <div className="marquee"><span>BEAUTIFULLY YOU</span> ✦ <span>THOUGHTFULLY CREATED</span> ✦ <span>FOREVER MOMENTS</span> ✦ <span>BEAUTIFULLY YOU</span> ✦ <span>THOUGHTFULLY CREATED</span> ✦</div>
  <section id="story" className="story section-wrap"><div className="story-visual"><div className="story-photo" role="img" aria-label="Editorial makeup preparation photograph"/><div className="floating-note"><Sparkles size={23}/><span>THE BEAUTY IS<br/>IN BEING YOU.</span></div></div><div className="story-copy"><div className="eyebrow">01 / THE PHILOSOPHY</div><h2>Not just makeup.<br/><em>A feeling.</em></h2><p>At Sunidhi Artistry, beauty is personal. Every brushstroke is about bringing out what makes you, you — never hiding it.</p><p>Whether it&apos;s your wedding day or a celebration close to your heart, the goal is simple: for you to look in the mirror and feel like the most radiant version of yourself.</p><a className="under-link" href="#book">LET&apos;S CREATE YOUR LOOK <ArrowUpRight size={16}/></a></div></section>
  <section id="services" className="services section-wrap"><div className="section-top"><div><div className="eyebrow">02 / WHAT WE DO</div><h2>Beauty for <em>every</em><br/>kind of moment.</h2></div><p>From once-in-a-lifetime celebrations to nights you&apos;ll never forget, there&apos;s a little magic for every occasion.</p></div><div className="service-grid">{services.map(service=><article className="service-card" key={service.id}><div className="service-img" style={{backgroundImage:`url("${service.image}")`}}><span className="service-tag">{service.tag}</span><span className="image-note" title={imageNotes}>REFERENCE IMAGE</span></div><div className="service-meta"><span>{service.id} / THE EXPERIENCE</span><ArrowUpRight size={21}/></div><h3>{service.title}</h3><p>{service.description}</p><a href="#book">ENQUIRE NOW <ArrowRight size={16}/></a></article>)}</div></section>
  <section id="gallery" className="gallery"><div className="gallery-header section-wrap"><div className="eyebrow">03 / THE EDIT</div><h2>Moments, made <em>beautiful.</em></h2><p>A little inspiration for your own signature look.</p></div><div className="gallery-grid"><div className="gallery-pic pic-one" role="img" aria-label="Editorial beauty reference"/><div className="gallery-pic pic-two" role="img" aria-label="Editorial bridal beauty reference"/><div className="gallery-pic pic-three" role="img" aria-label="Editorial makeup reference"/></div><p className="gallery-disclaimer">Editorial reference photography only. Actual artist portfolio photographs will be added with permission.</p></section>
  <section className="quote"><span>✦</span><p>“The most beautiful thing<br/>you can wear is <em>confidence.</em>”</p><div>YOUR BEAUTY. YOUR STORY. YOUR MOMENT.</div></section>
  <section id="book" className="booking section-wrap"><div className="booking-intro"><div className="eyebrow">04 / LET'S CONNECT</div><h2>Let&apos;s make your<br/><em>moment magic.</em></h2><p>Tell us a little about your celebration. Send an enquiry and we&apos;ll get back to you about availability and the next steps.</p><div className="booking-promise"><CalendarDays size={22}/><div><strong>Made just for your day</strong><span>Every enquiry is reviewed personally.</span></div></div><div className="booking-promise"><Heart size={22}/><div><strong>Thoughtfully yours</strong><span>We'll help you find the right beauty experience.</span></div></div><div className="booking-small">Please note: submitting this form is an enquiry, not an appointment confirmation.</div></div>
  <form className="booking-form" onSubmit={submit}><div className="form-heading">YOUR BEAUTY BEGINS HERE <span>✳</span></div><div className="form-row"><label>YOUR NAME <input name="name" required minLength={2} maxLength={100} placeholder="Full name" autoComplete="name"/></label><label>EMAIL ADDRESS <input name="email" type="email" required placeholder="you@example.com" autoComplete="email"/></label></div><div className="form-row"><label>PHONE NUMBER <input name="phone" type="tel" required minLength={7} maxLength={20} placeholder="+91 98765 43210" autoComplete="tel"/></label><label>SERVICE <select name="service" required defaultValue=""><option value="" disabled>Select an experience</option><option>Bridal Makeup</option><option>Engagement Makeup</option><option>Party Makeup</option><option>Special Occasion</option></select></label></div><label>EVENT DATE <input type="date" name="eventDate" min={new Date().toISOString().slice(0,10)}/></label><label>TELL US MORE <textarea name="message" maxLength={1500} rows={4} placeholder="Your event, venue, the look you're dreaming of…"/></label><div className="honey" aria-hidden="true"><label>Leave this blank <input name="website" tabIndex={-1} autoComplete="off"/></label></div><button className="button dark submit" disabled={busy} type="submit">{busy ? "SENDING…" : "SEND MY ENQUIRY"} <ArrowUpRight size={17}/></button>{feedback && <p className={success ? "form-feedback success" : "form-feedback error"} role="status">{success && <CheckCircle2 size={18}/>} {feedback}</p>}<span className="form-privacy">We use your details only to respond to your enquiry.</span></form></section>
  <footer id="contact" className="footer"><div className="footer-top"><div><a className="footer-brand" href="#home">sunidhi <em>artistry.</em></a><p>Beauty that looks like you.<br/>Magic that feels like you.</p></div><div className="footer-links"><a href="#story">OUR STORY</a><a href="#services">SERVICES</a><a href="#gallery">THE EDIT</a><a href="#book">ENQUIRE</a></div><div className="footer-social"><span>FOLLOW THE JOURNEY</span><p>Social media links will be added after verification.</p><Instagram size={22}/></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} SUNIDHI ARTISTRY. ALL RIGHTS RESERVED.</span><span>CRAFTED WITH ♡ FOR BEAUTIFUL MOMENTS</span></div></footer>
 </main>;
}
