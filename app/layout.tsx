import type { Metadata } from "next";
import "./globals.css";
import "./premium.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppConcierge from "@/components/WhatsAppConcierge";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://sunidhimakeup.vercel.app";
export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "Sunidhi Artistry | Bridal Makeup Artist in Nawada, Bihar", template: "%s | Sunidhi Artistry" },
  description: "Discover signature bridal and occasion makeup by Sunidhi Artistry in Nawada, Bihar. Explore real client looks and request your appointment.",
  openGraph: {
    type: "website", title: "Sunidhi Artistry | Bridal Makeup & Beauty",
    description: "Bridal beauty with a signature touch.",
    images: ["/images/real-bridal-1.webp"]
  },
  robots: { index: true, follow: true }
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <SiteHeader/>
    {children}
    <SiteFooter/>
    <WhatsAppConcierge/>
  </body></html>;
}
