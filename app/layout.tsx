import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
const site=process.env.NEXT_PUBLIC_SITE_URL||"https://sunidhiartistry-38na.vercel.app";
export const metadata:Metadata={metadataBase:new URL(site),title:{default:"Sunidhi Artistry | Bridal Makeup Artist in Nawada, Bihar",template:"%s | Sunidhi Artistry"},description:"Sunidhi Artistry creates personalised bridal, engagement, reception and occasion makeup in Nawada, Bihar. Explore actual client work, services, packages and enquire about your date.",openGraph:{type:"website",title:"Sunidhi Artistry | Bridal Makeup & Beauty",description:"Where every bride glows differently.",images:["/images/real-bridal-1.webp"]},robots:{index:true,follow:true}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body><SiteHeader/>{children}<SiteFooter/></body></html>}
