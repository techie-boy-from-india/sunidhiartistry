import type { Metadata } from "next";
import "./globals.css";
import "./premium.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppConcierge from "@/components/WhatsAppConcierge";
import { SITE_ORIGIN } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "Bridal Makeup Artist in Nawada, Bihar | Sunidhi Artistry",
    template: "%s | Sunidhi Artistry"
  },
  description: "Looking for a bridal makeup artist in Nawada, Bihar? Explore Sunidhi Artistry's bridal, engagement, reception and party makeup, real work and booking enquiries.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Sunidhi Artistry",
    title: "Bridal Makeup Artist in Nawada, Bihar | Sunidhi Artistry",
    description: "Bridal, engagement and party makeup services in Nawada, Bihar. View real client looks and enquire about your event date.",
    url: SITE_ORIGIN,
    images: [{ url: "/images/real-bridal-1.webp", alt: "Sunidhi Artistry bridal makeup portfolio" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Bridal Makeup Artist in Nawada, Bihar | Sunidhi Artistry",
    description: "Bridal and occasion makeup by Sunidhi Artistry in Nawada, Bihar.",
    images: ["/images/real-bridal-1.webp"]
  },
  robots: { index: true, follow: true },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body>
    <SiteHeader/>
    {children}
    <SiteFooter/>
    <WhatsAppConcierge/>
  </body></html>;
}
