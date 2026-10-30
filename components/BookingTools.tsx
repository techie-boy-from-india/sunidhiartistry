"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CalendarClock, IndianRupee, MessageCircle, Save } from "lucide-react";
import type { BookingRow } from "@/components/AdminDashboard";

export default function BookingTools({ row }: { row: BookingRow }) {
  const router = useRouter();
  const [eventDate, setEventDate] = useState(row.eventDate || "");
  const [startTime, setStartTime] = useState(row.startTime || "");
  const [endTime, setEndTime] = useState(row.endTime || "");
  const [allDay, setAllDay] = useState(!row.startTime);
  const [total, setTotal] = useState(String(row.totalRupees));
  const [paid, setPaid] = useState(String(row.receivedRupees));
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [problem, setProblem] = useState(false);
  const digits = row.phone.replace(/\D/g, "");
  const whatsappNumber = digits.length === 10 ? "91" + digits : digits;
  const whatsapp = whatsappNumber.length >= 11 && whatsappNumber.length <= 15 ?
    "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent("Hello " + row.name + ", this is Sunidhi Artistry regarding your " + row.service + " booking request.") : "";
  async function submit(event: FormEvent<HTMLFormElement>, kind: "schedule" | "payment") {
    event.preventDefault(); setSaving(kind); setProblem(false); setMessage("");
    try {
      const payload = kind === "schedule"
        ? { eventDate, startTime: allDay ? null : startTime, endTime: allDay ? null : endTime }
        : { totalRupees: Number(total), receivedRupees: Number(paid) };
      const response = await fetch("/api/admin/bookings/" + row.id + "/" + kind, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save");
      const base=kind === "schedule" ? "Appointment date/time saved." : "Manual payment notes saved.";
      setMessage(base+(result.email === "sent" ? " Email accepted for delivery." :
        result.email === "queued" ? " Customer email queued; check Emails in the admin menu." :
        result.email === "disabled" ? " Customer email notifications are disabled." : ""));
      router.refresh();
    } catch (e) { setProblem(true); setMessage(e instanceof Error ? e.message : "Unable to save changes."); }
    finally { setSaving(""); }
  }
  return <details className="booking-tools">
    <summary><CalendarClock size={14}/> Manage date & payment</summary>
    <div className="booking-tools-content">
      <form onSubmit={e => submit(e,"schedule")}>
        <strong>Appointment timing</strong>
        <label>Event date<input aria-label={"Event date for " + row.name} type="date" required value={eventDate} onChange={e => setEventDate(e.target.value)}/></label>
        <label className="booking-check"><input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)}/> Whole-day appointment / no fixed time</label>
        {!allDay && <div className="booking-two"><label>Start<input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)}/></label><label>End<input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)}/></label></div>}
        <button disabled={saving !== ""} type="submit"><Save size={14}/> {saving === "schedule" ? "Saving…" : "Save appointment"}</button>
      </form>
      <form onSubmit={e => submit(e,"payment")}>
        <strong><IndianRupee size={14}/> Manual payment tracking</strong>
        <div className="booking-two"><label>Total quote (₹)<input type="number" min="0" max="1000000000" step="1" required value={total} onChange={e => setTotal(e.target.value)}/></label>
          <label>Received (₹)<input type="number" min="0" max="1000000000" step="1" required value={paid} onChange={e => setPaid(e.target.value)}/></label></div>
        <small>Due: ₹{Math.max(0, Number(total) - Number(paid)).toLocaleString("en-IN")}. Enter only payments you have independently verified.</small>
        <button disabled={saving !== ""} type="submit"><Save size={14}/> {saving === "payment" ? "Saving…" : "Save payment notes"}</button>
      </form>
      {whatsapp && <a className="booking-whatsapp" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={16}/> Message on WhatsApp ↗</a>}
      {message && <p className={problem ? "booking-tools-error" : "booking-tools-success"} role="status">{message}</p>}
    </div>
  </details>;
}
