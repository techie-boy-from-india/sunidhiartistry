import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const publicRoutes = [
  { path: "/", priority: 1 },
  { path: "/bridal-makeup-nawada", priority: 0.9 },
  { path: "/services", priority: 0.9 },
  { path: "/party-makeup-nawada", priority: 0.8 },
  { path: "/portfolio", priority: 0.8 },
  { path: "/about", priority: 0.65 },
  { path: "/contact", priority: 0.85 }
];
export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map(({path,priority}) => ({
    url: absoluteUrl(path),
    changeFrequency: "monthly",
    priority
  }));
}
