export const contact = {
  phone: "+91 73669 24999",
  whatsapp: "https://wa.me/917366924999",
  email: "contactsunidhiartistry@gmail.com",
  instagramHandle: "@sunidhi.artistry",
  instagram: "https://www.instagram.com/sunidhi.artistry/",
  city: "Nawada, Bihar – 805110",
};
export const services = [
 {name:"Bridal Makeup", price:"₹15,000 – ₹35,000",desc:"Signature full bridal look with HD finish, lashes, draping and trial.",image:"real-bridal-1.webp",category:"Bridal"},
 {name:"Engagement Makeup", price:"₹8,000 – ₹15,000",desc:"Soft, romantic glam for your engagement day.",image:"real-bridal-4.webp",category:"Engagement"},
 {name:"Reception Makeup", price:"₹10,000 – ₹20,000",desc:"Bold, modern evening look that lasts all night.",image:"real-bridal-5.webp",category:"Reception"},
 {name:"Party Makeup", price:"₹4,500 – ₹8,000",desc:"Statement looks for cocktails, sangeet, birthdays.",image:"real-party-1.webp",category:"Party"},
 {name:"Photoshoot Makeup", price:"₹5,000 – ₹10,000",desc:"Camera-perfect HD finish for studio & lifestyle shoots.",image:"real-party-2.webp",category:"Event"},
 {name:"Event Makeup", price:"₹3,500 – ₹7,000",desc:"Festive looks for haldi, mehendi, family functions.",image:"real-party-3.webp",category:"Event"}
] as const;
export const packages = [
 {name:"Silver",sub:"The Essentials",price:"₹15,000",items:["Bridal HD Makeup","Basic Hair Styling","Saree / Lehenga Draping","Premium Lashes","Touch-up Kit"]},
 {name:"Gold",sub:"Most Loved",price:"₹25,000",items:["Everything in Silver","Pre-wedding Trial","Advanced Hair Styling","Jewellery Setting","Pre-bridal Facial","On-location Service"]},
 {name:"Premium",sub:"The Royal Treatment",price:"₹40,000+",items:["Everything in Gold","Airbrush HD Finish","Engagement + Wedding Day","Personal Beauty Consultation","Family Member Touch-up","Complimentary Saree Draping"]}
] as const;
export const additional = [{name:"Hair Styling",price:"₹1,500 – ₹4,000"},{name:"Saree Draping",price:"₹800 – ₹1,500"},{name:"Jewellery Setting",price:"₹500 – ₹1,000"},{name:"Facial / Cleanup",price:"₹1,200 – ₹3,000"}] as const;
export const addons = [{name:"Extra Lashes (premium)",price:"₹500"},{name:"Extension Hair Setting",price:"₹1,500"},{name:"Nail Art",price:"₹800"},{name:"Additional Family Member Makeup",price:"₹3,500+"},{name:"Pre-bridal Skin Care Package",price:"₹5,000"},{name:"Outstation Travel",price:"On Request"}] as const;
export const photos = [
 {src:"real-bridal-1.webp", category:"Bridal", alt:"Sunidhi Artistry bride in gold and red bridal attire"},
 {src:"real-bridal-2.webp", category:"Bridal", alt:"Bridal client in traditional red attire"},
 {src:"real-bridal-4.webp", category:"Engagement", alt:"Client with red sari and elegant jewellery"},
 {src:"real-bridal-5.webp", category:"Reception", alt:"Bride wearing an ornate tiara and silver attire"},
 {src:"real-bridal-6.webp", category:"Bridal", alt:"Bridal beauty look with pink drape"},
 {src:"real-party-1.webp", category:"Party", alt:"Evening party look in red"},
 {src:"real-party-2.webp", category:"Event", alt:"Photoshoot client in turquoise dress"},
 {src:"real-party-3.webp", category:"Event", alt:"Evening makeup look in green attire"}
] as const;
export const faqs = [
 {q:"How do I book a slot?",a:"Send a booking enquiry with your event date and preferred service. We confirm availability and details before accepting a booking."},
 {q:"Do you travel for destination weddings?",a:"Outstation travel is available on request. Please share your venue and date for a personalised quote."},
 {q:"Which products do you use?",a:"We work with professional beauty brands including MAC, Huda Beauty, Charlotte Tilbury, Bobbi Brown, NARS, Estée Lauder and Kryolan."},
 {q:"Do you offer trial sessions?",a:"A pre-wedding trial is included in the Gold and Premium packages. Please enquire for other trial arrangements."},
 {q:"What is the booking advance?",a:"Advance payment requirements are confirmed during consultation. Your date is only secured after confirmation."}
] as const;
