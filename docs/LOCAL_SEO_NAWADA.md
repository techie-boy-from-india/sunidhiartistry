# Sunidhi Artistry — Local SEO rollout for Nawada, Bihar

## Canonical target
- Primary website: https://sunidhimakeup.vercel.app
- Homepage: makeup artist / bridal makeup artist in Nawada, Bihar (brand and location).
- /bridal-makeup-nawada: bridal makeup, HD bridal makeup, airbrush bridal packages, bridal trial, wedding makeup, bridal makeup price in Nawada.
- /party-makeup-nawada: party makeup, engagement makeup, reception makeup, occasion/celebration makeup in Nawada.
- /services: all makeup services, bridal packages and prices, saree draping and hair styling.
- /portfolio: real bridal and party makeup portfolio (photo-led intent).
- /about: Sunidhi Artistry brand, makeup artist/founder in Nawada.
- /contact: bridal makeup booking enquiry, makeup artist WhatsApp and contact Nawada.

**Keyword variations to monitor** in Google Search Console, not to cram into title or meta-keywords:
- bridal makeup artist Nawada / bridal makeup Nawada Bihar
- makeup artist in Nawada / makeup artist Nawada Bihar
- wedding makeup artist Nawada / bridal makeup packages Nawada
- HD bridal makeup Nawada / airbrush bridal makeup Nawada
- engagement makeup Nawada / reception makeup Nawada
- party makeup artist Nawada / makeup for sangeet and haldi Nawada
- photoshoot makeup Nawada / event makeup Nawada
- dulhan makeup Nawada / shadi makeup Nawada
- makeup artist Nawada price / bridal makeup price Nawada
- Sunidhi Artistry Nawada / Sunidhi makeup Nawada
- outstation bridal makeup Bihar (**only** on request, never guaranteed).

Avoid synthetic “best / #1 / top rated / cheapest / near me” claims, hundreds of near-identical city doorway pages, fake Google reviews, repeated meta-keywords and guaranteed ranking statements. Google Search **does not use the meta-keywords tag**.

## Implemented
- Unique descriptive metadata (titles, descriptions, canonical tags, OG/Twitter tags) on each indexable public route.
- Canonical host is **fixed** in lib/seo.ts to prevent preview hostnames entering the sitemap or canonical metadata.
- Valid structured-data output using JSON-LD for the business, WebSite, service content and breadcrumbs. No fabricated review counts, opening hours, house number, map coordinates or ratings.
- robots.txt blocks admin and API routes, sitemap includes only intended public pages; admin pages also carry noindex metadata.
- Two genuinely informative local service guides linked from home/services/footer, with helpful FAQ content and real local booking information.
- Original studio photos, descriptive alt text, responsive image sizing and link paths retained.
- Configurable Google Search Console verification token in `GOOGLE_SITE_VERIFICATION`; no secret hardcoded.

## Owner actions (required for real local SEO)
1. **Confirm actual NAP** (business name, customer-facing phone, full address if public, local area served, hours, website, verified Instagram, business email) with Sunidhi. The site currently knows *Nawada, Bihar 805110*, but **does not have a verified street address or business hours**. Do not add imaginary details.
2. Verify ownership in **Google Search Console** (URL-prefix property for https://sunidhimakeup.vercel.app/ or DNS property after buying a domain). Either place the Search Console HTML verification token in Vercel `GOOGLE_SITE_VERIFICATION` and redeploy, or use DNS where supported. Never put verification secrets into GitHub.
3. Submit `https://sunidhimakeup.vercel.app/sitemap.xml` under **Search Console → Sitemaps**. Inspect homepage, bridal landing page, services and contact after deployment, and request indexing if useful. Check robots.txt & canonical fields.
4. If eligible, **claim/verify Sunidhi Artistry's Google Business Profile**, choose an accurate business category, service area, verified hours/address or hidden address as appropriate, website link, correct business phone and real photos. Follow Google's rules for service-area businesses. This is account-level manual setup; a JSON-LD snippet alone **will not** create a Maps ranking or Google Business listing.
5. Check with the owner before representing any service area outside Nawada. “Outstation on request” reflects the studio's current statement; do not manufacture permanent branches or offices in Patna/Gaya/Rajgir.
6. Keep phone and business name consistent across the website, Google Business Profile, Instagram, relevant industry listings, and legitimate local citations. Obtain genuine client reviews via an allowed, neutral review request process (no incentives or fake testimonials).
7. Test structured data in Google's **Rich Results Test**, including whether address is sufficiently detailed for LocalBusiness eligibility. A city-only PostalAddress is honest but may not qualify for every rich result.
8. Review queries, click-through rate, indexing, CWV/LCP, mobile usability and real customer enquiries monthly. Improve helpful content and photography based on actual data rather than adding more keyword variants.

## Release safety
The previous Phase 6 CMS broke the production page, so SEO remains in the **premium-design PR branch** until a Vercel Preview works. No database migration, app credentials or booking APIs are changed for this SEO release. If Vercel build limits are active, GitHub CI success is not proof of a live deployment.

## When the client buys a domain
Update **only** `SITE_ORIGIN` in `lib/seo.ts`, Vercel domains, verified Google properties, and social/profile links. Decide on permanent 301 redirects from the previous host, then regenerate/retest the sitemap and canonicals. Do not create conflicting canonical hosts.

Google Search Central references:
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/appearance/structured-data/local-business
- https://developers.google.com/search/docs/crawling-indexing/special-tags
