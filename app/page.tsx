import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarHeart, Check, Gem, Heart, Instagram, MessageCircle, ShieldCheck, Sparkles, Star } from "lucide-react";
import Photo from "@/components/Photo";
import JsonLd from "@/components/JsonLd";
import { businessSchema, websiteSchema } from "@/lib/seo";
import { contact, faqs, photos, services } from "@/lib/site";

const promises = [
  { icon: Gem, title: "Elegance, made personal", copy: "A beauty look that feels like you, only more radiant." },
  { icon: ShieldCheck, title: "Every detail matters", copy: "Thoughtful preparation, professional products and a calm approach." },
  { icon: Heart, title: "Moments made memorable", copy: "From your first consultation to the last beautiful detail." }
];

export default function Home() {
  return <main className="lux-home">
    <JsonLd data={[businessSchema(),websiteSchema()]}/>
    <section className="lux-hero" aria-labelledby="lux-hero-title">
      <div className="lux-orb lux-orb-left" aria-hidden="true"/><div className="lux-orb lux-orb-right" aria-hidden="true"/>
      <div className="wrap lux-hero-grid">
        <div className="lux-hero-content">
          <div className="lux-hero-kicker"><span className="lux-kicker-star">✳</span><span>THE ART OF BEING BEAUTIFULLY YOU</span><span className="lux-kicker-line"/></div>
          <h1 id="lux-hero-title">For every <span className="lux-script-line"><em>beautiful</em><i aria-hidden="true">✦</i></span> moment.</h1>
          <p>Timeless bridal beauty. An unmistakably personal touch. Discover makeup artistry that celebrates <strong>you</strong> and the moments worth remembering.</p>
          <div className="lux-hero-actions">
            <Link href="/contact#book" className="lux-button lux-button-primary">Make a booking request <ArrowUpRight size={18}/></Link>
            <Link href="/portfolio" className="lux-button lux-button-outline">Explore the portfolio <ArrowRight size={18}/></Link>
          </div>
          <div className="lux-hero-foot"><span className="lux-foot-icon"><Sparkles size={17}/></span><span><strong>Sunidhi Artistry</strong><small>Bridal · Engagement · Celebrations · Nawada, Bihar</small></span></div>
        </div>
        <div className="lux-hero-stage">
          <div className="lux-stage-halo" aria-hidden="true"/>
          <div className="lux-stage-frame"><Photo name="real-bridal-1.webp" alt="Bridal makeup look by Sunidhi Artistry" className="lux-primary-portrait" priority/></div>
          <div className="lux-stage-secondary"><Photo name="real-bridal-4.webp" alt="Elegant engagement makeup by Sunidhi Artistry" className="lux-secondary-portrait"/></div>
          <div className="lux-stage-note"><span>✦</span><span>THE SUNIDHI SIGNATURE<small>Soft elegance, lasting impressions</small></span></div>
          <div className="lux-stage-number" aria-hidden="true">01 / BEAUTY</div>
        </div>
      </div>
      <div className="lux-hero-bottom wrap"><span>MODERN ARTISTRY. TIMELESS FEELING.</span><a href="#signature" aria-label="Discover our signature looks">DISCOVER MORE <ArrowDownRight size={16}/></a></div>
    </section>

    <div className="lux-ticker" aria-hidden="true"><div className="lux-ticker-track">
      {Array.from({length:2},(_,i)=><span key={i}>BRIDAL BEAUTY <b>✦</b> PERSONAL STYLE <b>✦</b> ENGAGEMENT GLAM <b>✦</b> OCCASION MAKEUP <b>✦</b> BEAUTY WITH HEART <b>✦</b></span>)}
    </div></div>

    <section className="wrap lux-intro" id="signature">
      <div className="lux-intro-symbol" aria-hidden="true">✳</div>
      <span className="lux-eyebrow">THE SUNIDHI ARTISTRY EXPERIENCE</span>
      <h2>Not just makeup.<br/><em>A feeling you&apos;ll remember.</em></h2>
      <p>Every face tells a different story. Our work is to honour yours — with soft refinement, thoughtful details and a look that feels entirely your own.</p>
      <Link href="/about" className="lux-inline-link">Meet the artist <ArrowUpRight size={16}/></Link>
    </section>

    <section className="wrap local-home-seo" aria-labelledby="nawada-makeup-title">
      <div className="local-home-glass">
        <div><span className="lux-eyebrow">YOUR LOCAL MAKEUP ARTIST</span>
          <h2 id="nawada-makeup-title">Bridal Makeup Artist in <em>Nawada, Bihar</em></h2>
          <p>Planning a wedding or celebration in Nawada? Sunidhi Artistry offers personalised bridal makeup, engagement looks, reception makeup and party-ready styles. Tell us your event date, venue and preferred look; we&apos;ll discuss the right service and confirm availability before accepting your booking.</p>
          <p>Wedding makeup enquiries from other parts of Bihar are welcome, with travel and availability discussed individually.</p>
        </div>
        <div className="local-home-links">
          <Link href="/bridal-makeup-nawada">Bridal makeup in Nawada <ArrowUpRight size={18}/></Link>
          <Link href="/party-makeup-nawada">Party &amp; engagement makeup <ArrowUpRight size={18}/></Link>
          <Link href="/services">Makeup packages &amp; prices <ArrowUpRight size={18}/></Link>
          <Link href="/contact#book">Ask about a date <ArrowUpRight size={18}/></Link>
        </div>
      </div>
    </section>

    <section className="lux-signatures">
      <div className="wrap">
        <div className="lux-section-heading">
          <div><span className="lux-eyebrow">DISCOVER YOUR SIGNATURE LOOK</span><h2>Beautifully crafted,<br/><em>just for you.</em></h2></div>
          <div className="lux-section-side"><p>Every occasion deserves its own kind of magic. Explore our most-loved makeup experiences.</p>
            <Link href="/services" className="lux-inline-link">All services & prices <ArrowUpRight size={16}/></Link></div>
        </div>
        <div className="lux-service-grid">
          {services.slice(0,3).map((service,index)=><Link key={service.name} href="/services" className="lux-service-card">
            <Photo name={service.image} alt={service.name+" by Sunidhi Artistry"} className="lux-service-photo"/>
            <div className="lux-service-number">0{index+1}</div>
            <div className="lux-service-info"><span>{service.category.toUpperCase()} · SUNIDHI ARTISTRY</span>
              <div><h3>{service.name}</h3><span className="lux-service-arrow"><ArrowUpRight size={21}/></span></div>
              <p>{service.desc}</p><small>{service.price}</small>
            </div>
          </Link>)}
        </div>
        <div className="lux-service-note"><Sparkles size={17}/> Looking for party, reception or photoshoot glam? <Link href="/services">Explore every service <ArrowUpRight size={14}/></Link></div>
      </div>
    </section>

    <section className="wrap lux-story" aria-labelledby="lux-story-heading">
      <div className="lux-story-gallery">
        <Photo name="real-bridal-6.webp" alt="Bridal makeup in a delicate pink drape" className="lux-story-main-photo"/>
        <div className="lux-story-minor"><Photo name="real-party-2.webp" alt="Editorial party makeup by Sunidhi Artistry" className="lux-story-small-photo"/></div>
        <div className="lux-story-seal">BEAUTY<br/><span>that is</span><br/>UNIQUELY YOU <Sparkles size={15}/></div>
      </div>
      <div className="lux-story-content">
        <span className="lux-eyebrow">BEHIND THE BRUSH</span>
        <h2 id="lux-story-heading">A little artistry.<br/>A lot of <em>heart.</em></h2>
        <p>I believe your makeup should make you feel more like yourself, not someone else. That&apos;s why every look begins with listening, understanding and creating together.</p>
        <div className="lux-story-quote"><span>“</span><p>Because the most beautiful version of you is still <em>you.</em></p></div>
        <Link href="/about" className="lux-button lux-button-primary">Get to know Sunidhi <ArrowUpRight size={18}/></Link>
      </div>
    </section>

    <section className="lux-promise-section">
      <div className="wrap"><div className="lux-centered-heading"><span className="lux-eyebrow">THE LITTLE THINGS</span><h2>Beauty lives <em>in the details.</em></h2></div>
        <div className="lux-promise-grid">{promises.map(({icon:Icon,title,copy},i)=><div className="lux-promise" key={title}>
          <span className="lux-promise-index">0{i+1} — THE PROMISE</span><span className="lux-promise-icon"><Icon size={27}/></span>
          <h3>{title}</h3><p>{copy}</p>
        </div>)}</div>
      </div>
    </section>

    <section className="wrap lux-gallery">
      <div className="lux-section-heading">
        <div><span className="lux-eyebrow">THE BEAUTY DIARY</span><h2>Real faces.<br/><em>Unforgettable moments.</em></h2></div>
        <div className="lux-section-side"><p>A few lovely faces and stories from behind our brushes.</p>
          <Link href="/portfolio" className="lux-inline-link">View the full portfolio <ArrowUpRight size={16}/></Link></div>
      </div>
      <div className="lux-gallery-grid">
        {photos.slice(0,4).map((photo,i)=><Link href="/portfolio" className={"lux-gallery-item lux-gallery-item-"+i} key={photo.src} aria-label={"View "+photo.category+" makeup portfolio"}>
          <Photo name={photo.src} alt={photo.alt}/><span>{photo.category} <ArrowUpRight size={15}/></span>
        </Link>)}
      </div>
      <div className="lux-gallery-bottom"><span>THE MOMENTS, THE MAGIC, THE MEMORIES.</span>
        <a href={contact.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={17}/> FOLLOW THE BEAUTY DIARY <ArrowUpRight size={15}/></a></div>
    </section>

    <section className="lux-faq-section"><div className="wrap lux-faq-grid">
      <div className="lux-faq-intro"><span className="lux-eyebrow">A LITTLE PEACE OF MIND</span><h2>You have questions.<br/><em>We have answers.</em></h2><p>All the little things you might want to know before booking your special day.</p>
        <div className="lux-faq-flower" aria-hidden="true">✺</div>
      </div>
      <div className="lux-faq-list">{faqs.map((faq,i)=><details key={faq.q}>
        <summary><span>{String(i+1).padStart(2,"0")}</span>{faq.q}<b>＋</b></summary><p>{faq.a}</p>
      </details>)}</div>
    </div></section>

    <section className="wrap lux-end-section"><div className="lux-end-card">
      <div className="lux-end-orb" aria-hidden="true"/><span className="lux-eyebrow">LET&apos;S MAKE MAGIC</span>
      <Star size={28} fill="currentColor" className="lux-end-star" aria-hidden="true"/>
      <h2>Your story deserves<br/><em>beautiful details.</em></h2>
      <p>Tell us about your special day and we&apos;ll help you make it even more memorable. Dates are confirmed after consultation and availability checks.</p>
      <div className="lux-end-actions"><Link href="/contact#book" className="lux-button lux-button-white">Request your date <CalendarHeart size={18}/></Link>
        <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className="lux-button lux-button-translucent"><MessageCircle size={18}/> Chat on WhatsApp</a></div>
      <span className="lux-end-small"><Check size={14}/> Thoughtful artistry, made for your moment</span>
    </div></section>
  </main>;
}
