import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import AdminDashboard, { type BookingRow, type EnquiryRow, type CustomerRow, type AdminStats } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";
type Search = { tab?: string; q?: string; page?: string; status?: string };
const PAGE_SIZE = 25;

export default async function AdminPage({ searchParams }: { searchParams: Promise<Search> }) {
  if (!await isAdmin()) redirect("/admin/login");
  const params = await searchParams;
  const tab = ["overview","bookings","enquiries","customers"].includes(params.tab || "") ? params.tab! : "overview";
  const q = (params.q || "").trim().slice(0, 80);
  const pattern = `%${q}%`;
  const status = (params.status || "all").slice(0, 32);
  const page = Math.min(10000, Math.max(1, Number.isSafeInteger(Number(params.page)) ? Number(params.page) : 1));
  const offset = (page - 1) * PAGE_SIZE;
  let stats: AdminStats = { totalEnquiries: 0, newEnquiries: 0, totalBookings: 0, pendingBookings: 0, confirmedBookings: 0, customers: 0 };
  let bookings: BookingRow[] = [], enquiries: EnquiryRow[] = [], customers: CustomerRow[] = [];
  let count = 0;
  let setupError = "";
  try {
    const sql = db();
    const [enquiryTotals] = await sql<{total: number; fresh: number; customers: number}[]>`
      SELECT COUNT(*) FILTER (WHERE request_type = 'enquiry')::int AS total,
        COUNT(*) FILTER (WHERE request_type = 'enquiry' AND status = 'new')::int AS fresh,
        COUNT(DISTINCT lower(email))::int AS customers FROM enquiries
    `;
    const [bookingTotals] = await sql<{total: number; pending: number; confirmed: number}[]>`
      SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'confirmed')::int AS confirmed FROM bookings
    `;
    stats = {
      totalEnquiries: enquiryTotals.total, newEnquiries: enquiryTotals.fresh,
      totalBookings: bookingTotals.total, pendingBookings: bookingTotals.pending,
      confirmedBookings: bookingTotals.confirmed, customers: enquiryTotals.customers
    };
    if (tab === "overview" || tab === "bookings") {
      const valid = ["all","pending","confirmed","completed","cancelled"].includes(status) ? status : "all";
      bookings = await sql<BookingRow[]>`
        SELECT b.id::text AS id, b.status, e.name, e.email, e.phone, e.service,
          e.event_date::text AS "eventDate", e.message,
          to_char(e.created_at AT TIME ZONE 'Asia/Kolkata','DD Mon YYYY, HH12:MI AM') AS "createdAt"
        FROM bookings b JOIN enquiries e ON e.id = b.enquiry_id
        WHERE (${tab === "overview"} OR ${valid} = 'all' OR b.status = ${valid})
          AND (${tab === "overview"} OR e.name ILIKE ${pattern} OR e.email ILIKE ${pattern}
            OR e.phone ILIKE ${pattern} OR e.service ILIKE ${pattern})
        ORDER BY CASE WHEN b.status = 'pending' THEN 0 ELSE 1 END, b.created_at DESC
        LIMIT ${tab === "overview" ? 8 : PAGE_SIZE} OFFSET ${tab === "overview" ? 0 : offset}
      `;
      if (tab === "bookings") {
        const [rows] = await sql<{n: number}[]>`
          SELECT COUNT(*)::int AS n FROM bookings b JOIN enquiries e ON e.id = b.enquiry_id
          WHERE (${valid} = 'all' OR b.status = ${valid})
            AND (e.name ILIKE ${pattern} OR e.email ILIKE ${pattern} OR e.phone ILIKE ${pattern} OR e.service ILIKE ${pattern})
        `;
        count = rows.n;
      }
    }
    if (tab === "overview" || tab === "enquiries") {
      const valid = ["all","new","contacted","quoted","converted","lost"].includes(status) ? status : "all";
      enquiries = await sql<EnquiryRow[]>`
        SELECT id::text AS id, name, email, phone, service, request_type AS "requestType",
          event_date::text AS "eventDate", message, status,
          to_char(created_at AT TIME ZONE 'Asia/Kolkata','DD Mon YYYY, HH12:MI AM') AS "createdAt"
        FROM enquiries WHERE (${valid} = 'all' OR status = ${valid})
          AND (${tab === "overview"} OR name ILIKE ${pattern} OR email ILIKE ${pattern}
            OR phone ILIKE ${pattern} OR service ILIKE ${pattern})
        ORDER BY created_at DESC LIMIT ${tab === "overview" ? 8 : PAGE_SIZE}
          OFFSET ${tab === "overview" ? 0 : offset}
      `;
      if (tab === "enquiries") {
        const [rows] = await sql<{n: number}[]>`
          SELECT COUNT(*)::int AS n FROM enquiries
          WHERE (${valid} = 'all' OR status = ${valid})
            AND (name ILIKE ${pattern} OR email ILIKE ${pattern} OR phone ILIKE ${pattern} OR service ILIKE ${pattern})
        `;
        count = rows.n;
      }
    }
    if (tab === "customers") {
      customers = await sql<CustomerRow[]>`
        SELECT lower(email) AS email, (array_agg(name ORDER BY created_at DESC))[1] AS name,
          (array_agg(phone ORDER BY created_at DESC))[1] AS phone,
          count(*)::int AS "requestCount",
          to_char(max(created_at) AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY') AS "lastContact"
        FROM enquiries
        WHERE name ILIKE ${pattern} OR email ILIKE ${pattern} OR phone ILIKE ${pattern}
        GROUP BY lower(email) ORDER BY max(created_at) DESC
        LIMIT ${PAGE_SIZE} OFFSET ${offset}
      `;
      const [rows] = await sql<{n: number}[]>`
        SELECT COUNT(DISTINCT lower(email))::int AS n FROM enquiries
        WHERE name ILIKE ${pattern} OR email ILIKE ${pattern} OR phone ILIKE ${pattern}
      `;
      count = rows.n;
    }
  } catch {
    setupError = "Dashboard data unavailable. Configure DATABASE_URL and run db/001_init.sql followed by db/002_admin_booking.sql in Neon.";
  }
  return <AdminDashboard tab={tab} stats={stats} bookings={bookings} enquiries={enquiries} customers={customers}
    count={count} page={page} pageSize={PAGE_SIZE} q={q} status={status} setupError={setupError}/>;
}
