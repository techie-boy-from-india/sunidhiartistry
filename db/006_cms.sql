-- Phase 6: owner-managed content. Run after 001-005 in Neon SQL Editor.
-- Back up the production database. This migration is additive and non-destructive.
CREATE TABLE IF NOT EXISTS cms_sections (
  section TEXT PRIMARY KEY CHECK (section IN ('settings','copy','services','packages','gallery','testimonials')),
  value JSONB NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO cms_sections(section,value) VALUES
('settings', '{"phone":"+91 73669 24999","whatsapp":"https://wa.me/917366924999","email":"contactsunidhiartistry@gmail.com","instagramHandle":"@sunidhi.artistry","instagram":"https://www.instagram.com/sunidhi.artistry/","city":"Nawada, Bihar – 805110"}'::jsonb),
('copy', '{"heroTitle":"Where Every Bride","heroAccent":"Glows Differently.","heroDescription":"Sunidhi Artistry creates elegant, personalised makeup looks for brides, parties and events across Bihar — with premium products and a soft, feminine touch.","aboutHeading":"Hi, I’m Sunidhi — and I believe every face has its own poetry.","aboutDescription":"A professional makeup artist specialising in bridal, party and event makeup. I create elegant, personalised looks that enhance natural beauty and confidence.","experienceClaim":"5+ Years’ Experience","bridalClaim":"500+ Happy Brides*"}'::jsonb),
('services', '[
{"name":"Bridal Makeup","price":"₹15,000 – ₹35,000","desc":"Signature full bridal look with HD finish, lashes, draping and trial.","image":"real-bridal-1.webp","category":"Bridal","active":true},
{"name":"Engagement Makeup","price":"₹8,000 – ₹15,000","desc":"Soft, romantic glam for your engagement day.","image":"real-bridal-4.webp","category":"Engagement","active":true},
{"name":"Reception Makeup","price":"₹10,000 – ₹20,000","desc":"Bold, modern evening look that lasts all night.","image":"real-bridal-5.webp","category":"Reception","active":true},
{"name":"Party Makeup","price":"₹4,500 – ₹8,000","desc":"Statement looks for cocktails, sangeet, birthdays.","image":"real-party-1.webp","category":"Party","active":true},
{"name":"Photoshoot Makeup","price":"₹5,000 – ₹10,000","desc":"Camera-perfect HD finish for studio & lifestyle shoots.","image":"real-party-2.webp","category":"Event","active":true},
{"name":"Event Makeup","price":"₹3,500 – ₹7,000","desc":"Festive looks for haldi, mehendi, family functions.","image":"real-party-3.webp","category":"Event","active":true}]'::jsonb),
('packages','[
{"name":"Silver","sub":"The Essentials","price":"₹15,000","items":["Bridal HD Makeup","Basic Hair Styling","Saree / Lehenga Draping","Premium Lashes","Touch-up Kit"],"active":true},
{"name":"Gold","sub":"Most Loved","price":"₹25,000","items":["Everything in Silver","Pre-wedding Trial","Advanced Hair Styling","Jewellery Setting","Pre-bridal Facial","On-location Service"],"active":true},
{"name":"Premium","sub":"The Royal Treatment","price":"₹40,000+","items":["Everything in Gold","Airbrush HD Finish","Engagement + Wedding Day","Personal Beauty Consultation","Family Member Touch-up","Complimentary Saree Draping"],"active":true}]'::jsonb),
('gallery','[
{"src":"real-bridal-1.webp","category":"Bridal","alt":"Sunidhi Artistry bride in gold and red bridal attire","active":true},
{"src":"real-bridal-2.webp","category":"Bridal","alt":"Bridal client in traditional red attire","active":true},
{"src":"real-bridal-4.webp","category":"Engagement","alt":"Client with red sari and elegant jewellery","active":true},
{"src":"real-bridal-5.webp","category":"Reception","alt":"Bride wearing an ornate tiara and silver attire","active":true},
{"src":"real-bridal-6.webp","category":"Bridal","alt":"Bridal beauty look with pink drape","active":true},
{"src":"real-party-1.webp","category":"Party","alt":"Evening party look in red","active":true},
{"src":"real-party-2.webp","category":"Event","alt":"Photoshoot client in turquoise dress","active":true},
{"src":"real-party-3.webp","category":"Event","alt":"Evening makeup look in green attire","active":true}]'::jsonb),
('testimonials','[]'::jsonb)
ON CONFLICT(section) DO NOTHING;
-- Existing images in public/images remain intact; Blob is used for future uploads.
