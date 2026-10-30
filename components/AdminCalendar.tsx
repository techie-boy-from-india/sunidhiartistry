"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Lock, Unlock } from "lucide-react";

export type CalendarBooking = { id: string; name: string; service: string; status: string; eventDate: string; startTime: string | null; endTime: string | null };
export type BlockedDay = { date: string; reason: string };
type Props = { month: string; bookings: CalendarBooking[]; blocked: BlockedDay[]; error: string };
const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function AdminCalendar({ month, bookings, blocked, error }: Props) {
  const router = useRouter();
  const [picked, setPicked] = useState<string | null>(null);
  const [reason, setReason] = useState("Unavailable");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);
  const [year, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, m - 1, 1));
  const count = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const selected = picked ?? (today.startsWith(month) ? today : month + "-01");
  const selectedBookings = bookings.filter(x => x.eventDate === selected);
  const block = blocked.find(x => x.date === selected);
  const selectedLabel = new Date(selected + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  function moveMonth(delta: number) {
    const d = new Date(Date.UTC(year, m - 1 + delta, 1));
    const monthKey = d.toISOString().slice(0, 7);
    router.push("/admin?tab=calendar&month=" + monthKey);
    setPicked(null); setFeedback(""); setFailed(false);
  }
  async function toggleBlock() {
    setBusy(true); setFeedback(""); setFailed(false);
    try {
      const response = await fetch("/api/admin/blocked-dates", {
        method: block ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selected, reason: reason.trim() || "Unavailable" })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to update availability");
      setFeedback(block ? "Date is available again." : "Date blocked successfully.");
      router.refresh();
    } catch (e) { setFailed(true); setFeedback(e instanceof Error ? e.message : "Unable to update availability."); }
    finally { setBusy(false); }
  }

  return <section className="admin-calendar-grid">
    <div className="admin-panel calendar-main">
      <div className="admin-panel-heading">
        <div><span className="admin-panel-subtitle">ONE ARTIST · ASIA/KOLKATA</span><h2>Availability calendar</h2></div>
        <div className="calendar-month-actions"><button onClick={() => moveMonth(-1)} aria-label="Previous month"><ArrowLeft size={18}/></button><strong>{first.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" })}</strong><button onClick={() => moveMonth(1)} aria-label="Next month"><ArrowRight size={18}/></button></div>
      </div>
      {error && <div className="admin-alert" role="alert">{error}</div>}
      <div className="calendar-legend"><span><i className="legend-confirmed"/> Confirmed</span><span><i className="legend-pending"/> Pending</span><span><i className="legend-blocked"/> Blocked</span></div>
      <div className="calendar-days">
        {weekDays.map(d => <div className="calendar-weekday" key={d}>{d}</div>)}
        {Array.from({ length: offset }, (_, i) => <div className="calendar-empty" key={"empty-" + i}/>)}
        {Array.from({ length: count }, (_, i) => {
          const day = month + "-" + String(i + 1).padStart(2, "0");
          const dayEvents = bookings.filter(b => b.eventDate === day);
          const isBlocked = blocked.some(b => b.date === day);
          const confirmed = dayEvents.filter(b => b.status === "confirmed" || b.status === "completed").length;
          const waiting = dayEvents.filter(b => b.status === "pending").length;
          return <button type="button" key={day} onClick={() => {setPicked(day);setFeedback("");}}
            className={"calendar-day " + (selected === day ? "selected " : "") + (day === today ? "today " : "") + (isBlocked ? "unavailable" : "")}
            aria-label={day + (isBlocked ? ", blocked" : "") + (confirmed ? ", " + confirmed + " confirmed" : "")}>
            <span className="calendar-num">{i + 1}</span>
            {isBlocked && <span className="calendar-chip blocked">Blocked</span>}
            {confirmed > 0 && <span className="calendar-chip confirmed">{confirmed} booked</span>}
            {waiting > 0 && <span className="calendar-chip waiting">{waiting} pending</span>}
          </button>;
        })}
      </div>
      <div className="calendar-hint"><CalendarDays size={16}/> Click a date to view requests or block availability. Pending requests do not reserve time.</div>
    </div>
    <aside className="admin-panel calendar-detail">
      <div className="admin-panel-heading"><div><span className="admin-panel-subtitle">SELECTED DATE</span><h2>{selectedLabel}</h2></div></div>
      <div className="calendar-detail-content">
        {block ? <div className="calendar-block-status"><Lock size={16}/><span><strong>Day blocked</strong><small>{block.reason}</small></span></div> :
          <div className="calendar-open-status"><CheckCircle2 size={17}/><span>Not manually blocked</span></div>}
        {selectedBookings.length ? <div className="calendar-event-list">
          {selectedBookings.map(b => <article key={b.id} className={"calendar-event calendar-event-" + b.status}>
            <div><strong>{b.name}</strong><span>{b.service}</span><small>{b.startTime && b.endTime ? b.startTime + " – " + b.endTime : "All-day / time not specified"}</small></div>
            <em>{b.status}</em>
          </article>)}
        </div> : <p className="calendar-empty-note">No active booking requests for this date.</p>}
        <div className="calendar-control">
          <label htmlFor="calendar-reason">Reason for blocking</label>
          <input id="calendar-reason" value={reason} onChange={e => setReason(e.target.value)} maxLength={200} placeholder="Holiday / Personal day"/>
          <button type="button" onClick={toggleBlock} disabled={busy || Boolean(error)} className={block ? "calendar-unblock" : "calendar-block"}>
            {block ? <Unlock size={17}/> : <Lock size={17}/>}
            {busy ? "Saving…" : block ? "Unblock this date" : "Block this date"}
          </button>
          {feedback && <p className={failed ? "calendar-error" : "calendar-success"} role="status">{feedback}</p>}
          <small>Blocking a date cannot override an existing confirmed appointment. Reschedule it first.</small>
        </div>
      </div>
    </aside>
  </section>;
}
