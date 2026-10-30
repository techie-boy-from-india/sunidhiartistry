import type { Metadata } from "next";
import "./admin.css";
import "./email-notification.css";
import "./analytics.css";

export const metadata: Metadata = {
  title: "Business Dashboard | Sunidhi Artistry",
  description: "Private booking and enquiry management",
  robots: { index: false, follow: false, noarchive: true }
};
export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-root">{children}</div>;
}
