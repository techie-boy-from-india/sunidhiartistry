import type { Metadata } from "next";
import "./globals.css";

const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const metadata: Metadata = {
 metadataBase: new URL(site),
 title: { default: "Sunidhi Artistry | Makeup & Bridal Beauty", template: "%s | Sunidhi Artistry" },
 description: "Discover elegant bridal, occasion and event makeup by Sunidhi Artistry. Enquire about your special day.",
 openGraph: { title: "Sunidhi Artistry", description: "Beauty that feels like you.", type: "website" },
 robots: { index: true, follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
