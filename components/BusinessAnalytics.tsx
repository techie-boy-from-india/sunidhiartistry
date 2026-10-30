import { ArrowUpRight, Banknote, CalendarDays, CircleCheck, Clock3, IndianRupee, MessageCircle, TrendingUp } from "lucide-react";
import type { BusinessAnalytics as Analytics } from "@/lib/analytics";

const money=(value:number)=>"₹"+Math.round(value).toLocaleString("en-IN");
export default function BusinessAnalytics({ data, warning }: { data:Analytics|null;warning:string }) {
  if (!data) return <section className="admin-panel analytics-empty"><h2>Analytics temporarily unavailable</h2><p>{warning || "We couldn't load your business totals."}</p></section>;
  const {totals,months,services}=data;
  const maxVolume=Math.max(1,...months.flatMap(m=>[m.bookings,m.enquiries]));
  const maxQuoted=Math.max(1,...months.map(m=>m.bookedRupees));
  const totalBookings=totals.pending+totals.confirmed+totals.completed+totals.cancelled;
  const conversion=totals.enquiries ? Math.round(totals.convertedEnquiries/totals.enquiries*100) : 0;
  return <div className="analytics-page">
    <div className="analytics-intro"><span className="admin-panel-subtitle">BUSINESS PERFORMANCE · ASIA/KOLKATA</span>
      <h2>The numbers behind your beautiful work.</h2><p>Monitor incoming requests and manually recorded payments, without spreadsheets.</p>
    </div>
    <div className="analytics-metrics">
      <article><span><Banknote size={18}/> RECORDED PAYMENTS</span><strong>{money(totals.recordedRupees)}</strong><small>Marked as received by admin · excludes cancelled bookings</small></article>
      <article><span><IndianRupee size={18}/> OUTSTANDING BALANCE</span><strong>{money(totals.outstandingRupees)}</strong><small>Remaining amounts in non-cancelled bookings</small></article>
      <article><span><CalendarDays size={18}/> TOTAL BOOKING REQUESTS</span><strong>{totalBookings}</strong><small>{totals.confirmed} confirmed · {totals.completed} completed</small></article>
      <article><span><MessageCircle size={18}/> ENQUIRY CONVERSION</span><strong>{conversion}%</strong><small>{totals.convertedEnquiries} of {totals.enquiries} general enquiries marked converted</small></article>
    </div>
    <div className="analytics-two-col">
      <section className="admin-panel analytics-chart">
        <div className="admin-panel-heading"><div><span className="admin-panel-subtitle">LAST 6 MONTHS</span><h2>Requests received</h2></div><TrendingUp size={20}/></div>
        <div className="analytics-legend"><span><i className="analytics-booking-key"/>Bookings</span><span><i className="analytics-enquiry-key"/>Enquiries</span></div>
        <div className="analytics-bars" role="img" aria-label="Bookings and enquiries received by month">
        {months.map(m=><div className="analytics-bar-group" key={m.key} title={m.label+": "+m.bookings+" bookings, "+m.enquiries+" enquiries"}>
          <div className="analytics-bar-pair"><div className="analytics-bar booking" style={{height:Math.max(3,m.bookings/maxVolume*100)+"%"}}/><div className="analytics-bar enquiry" style={{height:Math.max(3,m.enquiries/maxVolume*100)+"%"}}/></div>
          <strong>{m.label}</strong><small>{m.bookings} / {m.enquiries}</small>
        </div>)}</div>
        <div className="analytics-chart-note">Counts use the date each booking or enquiry was submitted, not the appointment date.</div>
      </section>
      <section className="admin-panel analytics-finance">
        <div className="admin-panel-heading"><div><span className="admin-panel-subtitle">FINANCIAL OVERVIEW</span><h2>Booking values</h2></div><Banknote size={20}/></div>
        <div className="analytics-money-large"><span>Agreed amounts (non-cancelled)</span><strong>{money(totals.quotedRupees)}</strong></div>
        <div className="analytics-progress" aria-label="Manually recorded payment progress"><div style={{width:(totals.quotedRupees>0?Math.min(100,totals.recordedRupees/totals.quotedRupees*100):0)+"%"}}/></div>
        <div className="analytics-money-rows"><p><span><CircleCheck size={16}/> Recorded as received</span><b>{money(totals.recordedRupees)}</b></p><p><span><Clock3 size={16}/> Outstanding</span><b>{money(totals.outstandingRupees)}</b></p></div>
        <p className="analytics-caveat">These values come from manually edited booking totals, not a bank statement or payment gateway. Cancelled bookings are excluded.</p>
      </section>
    </div>
    <section className="admin-panel analytics-monthly">
      <div className="admin-panel-heading"><div><span className="admin-panel-subtitle">6-MONTH TREND</span><h2>Value by request month</h2></div><ArrowUpRight size={20}/></div>
      <div className="analytics-value-list">{months.map(m=><div key={m.key} className="analytics-value-row">
        <span>{m.label}</span><div className="analytics-track"><div style={{width:Math.min(100,m.bookedRupees/maxQuoted*100)+"%"}}/></div>
        <strong>{money(m.bookedRupees)}</strong><small>{money(m.recordedRupees)} recorded</small>
      </div>)}</div>
      <p className="analytics-caveat">Values are grouped by booking creation month, not by the date cash arrived. For month-by-month cash flow, we’ll need a dated payment ledger.</p>
    </section>
    <section className="admin-panel analytics-services">
      <div className="admin-panel-heading"><div><span className="admin-panel-subtitle">SERVICE MIX</span><h2>Your most requested looks</h2></div></div>
      {services.length? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>SERVICE</th><th>REQUESTS</th><th>CONFIRMED / COMPLETED</th><th>AGREED VALUE</th></tr></thead>
      <tbody>{services.map(s=><tr key={s.service}><td><strong>{s.service}</strong></td><td>{s.bookings}</td><td>{s.confirmed}</td><td>{money(s.quotedRupees)}</td></tr>)}</tbody></table></div> :
        <p className="analytics-caveat">No booking requests yet. Service breakdown will appear once requests arrive.</p>}
    </section>
  </div>;
}
