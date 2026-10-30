import { db } from "@/lib/db";

export type AnalyticsMonth = {
  key: string;
  label: string;
  bookings: number;
  enquiries: number;
  bookedRupees: number;
  recordedRupees: number;
};
export type AnalyticsService = {
  service: string;
  bookings: number;
  confirmed: number;
  quotedRupees: number;
};
export type BusinessAnalytics = {
  totals: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    enquiries: number;
    convertedEnquiries: number;
    quotedRupees: number;
    recordedRupees: number;
    outstandingRupees: number;
  };
  months: AnalyticsMonth[];
  services: AnalyticsService[];
};

export async function loadBusinessAnalytics(): Promise<BusinessAnalytics> {
  const sql = db();
  const [counts] = await sql<{
    pending: number; confirmed: number; completed: number; cancelled: number;
    quoted: string; recorded: string; outstanding: string;
  }[]>`
    SELECT
      COUNT(*) FILTER (WHERE status='pending')::int AS pending,
      COUNT(*) FILTER (WHERE status='confirmed')::int AS confirmed,
      COUNT(*) FILTER (WHERE status='completed')::int AS completed,
      COUNT(*) FILTER (WHERE status='cancelled')::int AS cancelled,
      (COALESCE(SUM(total_amount_paise) FILTER (WHERE status <> 'cancelled'),0)::numeric/100)::text AS quoted,
      (COALESCE(SUM(amount_paid_paise) FILTER (WHERE status <> 'cancelled'),0)::numeric/100)::text AS recorded,
      (COALESCE(SUM(total_amount_paise-amount_paid_paise) FILTER (WHERE status <> 'cancelled'),0)::numeric/100)::text AS outstanding
    FROM bookings
  `;
  const [enquiryCounts] = await sql<{total:number;converted:number}[]>`
    SELECT COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status='converted')::int AS converted
    FROM enquiries WHERE request_type='enquiry'
  `;
  const monthRows = await sql<{
    key:string;label:string;bookings:number;enquiries:number;quoted:string;recorded:string;
  }[]>`
    WITH month_list AS (
      SELECT gs::date AS month_start
      FROM generate_series(
        date_trunc('month',now() AT TIME ZONE 'Asia/Kolkata') - interval '5 months',
        date_trunc('month',now() AT TIME ZONE 'Asia/Kolkata'),
        interval '1 month'
      ) gs
    ), monthly_bookings AS (
      SELECT date_trunc('month',created_at AT TIME ZONE 'Asia/Kolkata')::date AS month_start,
        COUNT(*)::int AS bookings,
        (COALESCE(SUM(total_amount_paise) FILTER (WHERE status<>'cancelled'),0)::numeric/100)::text AS quoted,
        (COALESCE(SUM(amount_paid_paise) FILTER (WHERE status<>'cancelled'),0)::numeric/100)::text AS recorded
      FROM bookings GROUP BY 1
    ), monthly_enquiries AS (
      SELECT date_trunc('month',created_at AT TIME ZONE 'Asia/Kolkata')::date AS month_start,
        COUNT(*)::int AS enquiries
      FROM enquiries WHERE request_type='enquiry' GROUP BY 1
    )
    SELECT to_char(m.month_start,'YYYY-MM') AS key,
      to_char(m.month_start,'Mon YY') AS label,
      COALESCE(b.bookings,0)::int AS bookings,
      COALESCE(e.enquiries,0)::int AS enquiries,
      COALESCE(b.quoted,'0') AS quoted,
      COALESCE(b.recorded,'0') AS recorded
    FROM month_list m
    LEFT JOIN monthly_bookings b ON b.month_start=m.month_start
    LEFT JOIN monthly_enquiries e ON e.month_start=m.month_start
    ORDER BY m.month_start
  `;
  const serviceRows = await sql<{
    service:string;bookings:number;confirmed:number;quoted:string;
  }[]>`
    SELECT e.service,COUNT(*)::int AS bookings,
      COUNT(*) FILTER (WHERE b.status IN ('confirmed','completed'))::int AS confirmed,
      (COALESCE(SUM(b.total_amount_paise) FILTER (WHERE b.status<>'cancelled'),0)::numeric/100)::text AS quoted
    FROM bookings b JOIN enquiries e ON e.id=b.enquiry_id
    GROUP BY e.service ORDER BY bookings DESC,e.service ASC LIMIT 10
  `;
  return {
    totals: {
      pending: counts.pending,confirmed:counts.confirmed,completed:counts.completed,cancelled:counts.cancelled,
      enquiries:enquiryCounts.total,convertedEnquiries:enquiryCounts.converted,
      quotedRupees:Number(counts.quoted),recordedRupees:Number(counts.recorded),
      outstandingRupees:Number(counts.outstanding)
    },
    months:monthRows.map(row=>({
      key:row.key,label:row.label,bookings:row.bookings,enquiries:row.enquiries,
      bookedRupees:Number(row.quoted),recordedRupees:Number(row.recorded)
    })),
    services:serviceRows.map(row=>({
      service:row.service,bookings:row.bookings,confirmed:row.confirmed,quotedRupees:Number(row.quoted)
    }))
  };
}
