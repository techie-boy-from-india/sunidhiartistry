import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import AdminDashboard, { type BookingRow, type EnquiryRow, type CustomerRow, type AdminStats } from "@/components/AdminDashboard";
import type { CalendarBooking, BlockedDay } from "@/components/AdminCalendar";
import { emailEnabled, pendingNotifications } from "@/lib/notifications";
import type { NotificationRecord } from "@/components/NotificationCenter";
import { loadBusinessAnalytics, type BusinessAnalytics as BusinessAnalyticsData } from "@/lib/analytics";

export const dynamic = "force-dynamic";
type Search = { tab?: string; q?: string; page?: string; status?: string; month?: string };
const PAGE_SIZE = 25;

export default async function AdminPage({ searchParams }: { searchParams: Promise<Search> }) {
  if (!await isAdmin()) redirect("/admin/login");
  const params = await searchParams;
  const tab = ["overview","calendar","bookings","enquiries","customers","analytics","notifications"].includes(params.tab || "") ? params.tab! : "overview";
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  const currentMonth = parts.find(p => p.type === "year")!.value + "-" + parts.find(p => p.type === "month")!.value;
  const candidateMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(params.month || "") ? params.month! : currentMonth;
  const month = Number(candidateMonth.slice(0,4)) >= 2020 && Number(candidateMonth.slice(0,4)) <= 2100 ? candidateMonth : currentMonth;
  const monthEnd = new Date(Date.UTC(Number(month.slice(0,4)), Number(month.slice(5,7)), 1)).toISOString().slice(0,10);
  const q = (params.q || "").trim().slice(0, 80);
  const pattern = `%${q}%`;
  const status = (params.status || "all").slice(0, 32);
  const page = Math.min(10000, Math.max(1, Number.isSafeInteger(Number(params.page)) ? Number(params.page) : 1));
  const offset = (page - 1) * PAGE_SIZE;
  let stats: AdminStats = { totalEnquiries: 0, newEnquiries: 0, totalBookings: 0, pendingBookings: 0, confirmedBookings: 0, customers: 0 };
  let bookings: BookingRow[] = [], enquiries: EnquiryRow[] = [], customers: CustomerRow[] = [];
  let calendarBookings: CalendarBooking[] = [], blockedDates: BlockedDay[] = [];
  let calendarError = "";
  const notificationState = { enabled:emailEnabled(),pending:0,failed:0 };
  const notificationRecords: NotificationRecord[] = [];
  let notificationWarning = "";
  let analytics:BusinessAnalyticsData|null = null;
  let analyticsWarning = "";
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
    if (tab === "analytics") {
      try { analytics=await loadBusinessAnalytics(); }
      catch { analyticsWarning="Unable to calculate reports from this database. Verify the Phase 3 migration and Neon connection."; }
    }
    if (tab === "calendar") {
      try {
        calendarBookings = await sql<CalendarBooking[]>`
          SELECT b.id::text AS id, e.name, e.service, b.status, e.event_date::text AS "eventDate",
            to_char((to_jsonb(b)->>'start_time')::time,'HH24:MI') AS "startTime",
            to_char((to_jsonb(b)->>'end_time')::time,'HH24:MI') AS "endTime"
          FROM bookings b JOIN enquiries e ON e.id=b.enquiry_id
          WHERE e.event_date >= ${month+"-01"}::date AND e.event_date < ${monthEnd}::date
            AND b.status <> 'cancelled'
          ORDER BY e.event_date, b.created_at LIMIT 500
        `;
        blockedDates = await sql<BlockedDay[]>`
          SELECT date::text AS date, reason FROM blocked_dates
          WHERE date >= ${month+"-01"}::date AND date < ${monthEnd}::date ORDER BY date
        `;
      } catch {
        calendarError = "Calendar is waiting for the Phase 3 database migration. Run db/003_calendar.sql in your Neon SQL Editor.";
      }
    }
    if (tab === "overview" || tab === "bookings") {
      const valid = ["all","pending","confirmed","completed","cancelled"].includes(status) ? status : "all";
      bookings = await sql<BookingRow[]>`
        SELECT b.id::text AS id, b.status, e.name, e.email, e.phone, e.service,
          e.event_date::text AS "eventDate", e.message,
          to_char((to_jsonb(b)->>'start_time')::time, 'HH24:MI') AS "startTime",
          to_char((to_jsonb(b)->>'end_time')::time, 'HH24:MI') AS "endTime",
          (COALESCE((to_jsonb(b)->>'total_amount_paise')::bigint, 0) / 100)::int AS "totalRupees",
          (COALESCE((to_jsonb(b)->>'amount_paid_paise')::bigint, 0) / 100)::int AS "receivedRupees",
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
        FROM enquiries WHERE request_type = 'enquiry' AND (${valid} = 'all' OR status = ${valid})
          AND (${tab === "overview"} OR name ILIKE ${pattern} OR email ILIKE ${pattern}
            OR phone ILIKE ${pattern} OR service ILIKE ${pattern})
        ORDER BY created_at DESC LIMIT ${tab === "overview" ? 8 : PAGE_SIZE}
          OFFSET ${tab === "overview" ? 0 : offset}
      `;
      if (tab === "enquiries") {
        const [rows] = await sql<{n: number}[]>`
          SELECT COUNT(*)::int AS n FROM enquiries
          WHERE request_type = 'enquiry' AND (${valid} = 'all' OR status = ${valid})
            AND (name ILIKE ${pattern} OR email ILIKE ${pattern} OR phone ILIKE ${pattern} OR service ILIKE ${pattern})
        `;
        count = rows.n;
      }
    }
    if (emailEnabled()) {
      try {
        const counts=await pendingNotifications();
        notificationState.pending=counts.pending;
        notificationState.failed=counts.failed;
        if (tab === "notifications") {
          const recent=await sql<NotificationRecord[]>`
            SELECT id::text AS id,recipient_email AS "recipientEmail",subject,event_type AS "eventType",
              status,last_error AS "lastError",
              to_char(created_at AT TIME ZONE 'Asia/Kolkata','DD Mon YYYY HH12:MI AM') AS "createdAt"
            FROM email_notifications ORDER BY created_at DESC LIMIT 60
          `;
          notificationRecords.push(...recent);
        }
      } catch {
        notificationWarning="Email activity is not available. Run db/004_email_notifications.sql in Neon.";
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
    count={count} page={page} pageSize={PAGE_SIZE} q={q} status={status} setupError={setupError}
    month={month} calendarBookings={calendarBookings} blockedDates={blockedDates} calendarError={calendarError}
    notificationState={notificationState} notificationRecords={notificationRecords} notificationWarning={notificationWarning}
    analytics={analytics} analyticsWarning={analyticsWarning}/>;
}
