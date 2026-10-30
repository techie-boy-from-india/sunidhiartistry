import type { Metadata } from "next";
import { contact, services } from "@/lib/site";

// One public canonical hostname. Change this when the client's permanent domain is launched.
export const SITE_ORIGIN = "https://sunidhimakeup.vercel.app";
export const BUSINESS_NAME = "Sunidhi Artistry";
export const LOCALITY = "Nawada, Bihar";
export const absoluteUrl = (path: string) => new URL(path, SITE_ORIGIN).toString();

export function pageSeo(input: {
  path: string;
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const image = input.image || "/images/real-bridal-1.webp";
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: BUSINESS_NAME,
      title: input.title + " | " + BUSINESS_NAME,
      description: input.description,
      url: absoluteUrl(input.path),
      images: [{ url: image, alt: "Bridal and occasion makeup by Sunidhi Artistry" }]
    },
    twitter: {
      card: "summary_large_image",
      title: input.title + " | " + BUSINESS_NAME,
      description: input.description,
      images: [image]
    }
  };
}
export function businessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": absoluteUrl("/#business"),
    name: BUSINESS_NAME,
    description: "Bridal, engagement, reception, party and occasion makeup services in Nawada, Bihar. Enquire about wedding day and outstation appointments.",
    url: SITE_ORIGIN + "/",
    image: [
      absoluteUrl("/images/real-bridal-1.webp"),
      absoluteUrl("/images/real-bridal-4.webp"),
      absoluteUrl("/images/real-party-1.webp")
    ],
    logo: absoluteUrl("/images/sunidhi-logo.webp"),
    telephone: contact.phone.replace(/\s/g, ""),
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nawada",
      addressRegion: "Bihar",
      postalCode: "805110",
      addressCountry: "IN"
      // Street address and coordinates are deliberately omitted until the owner confirms them.
    },
    areaServed: [
      { "@type": "City", name: "Nawada" },
      { "@type": "AdministrativeArea", name: "Bihar" }
    ],
    currenciesAccepted: "INR",
    sameAs: [contact.instagram],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Makeup Services",
      itemListElement: services.map(s => ({
        "@type": "OfferCatalog",
        name: s.name,
        itemListElement: [{
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.name,
            description: s.desc
          }
        }]
      }))
    }
    // No invented opening hours, reviews, ratings, map coordinates or exact street address.
  };
}
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: BUSINESS_NAME,
    inLanguage: "en-IN",
    url: absoluteUrl("/"),
    publisher: { "@id": absoluteUrl("/#business") }
  };
}
export function breadcrumbs(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}
export function serviceSchema({ name, description, path }: { name:string; description:string; path:string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl(path+"#service"),
    name,
    description,
    serviceType: "Makeup artistry",
    provider: { "@id": absoluteUrl("/#business") },
    areaServed: { "@type": "City", name: "Nawada", address: { "@type": "PostalAddress", addressRegion: "Bihar", addressCountry: "IN" } },
    url: absoluteUrl(path)
  };
}
