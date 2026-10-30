"use client";
import { useState, type FormEvent } from "react";

export default function EnquiryForm({services}:{services:string[]}) {
  const [tab, setTab] = useState<"booking" | "enquiry">("booking");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true); setMessage(""); setOk(false);
    const form = e.currentTarget;
    const d = new FormData(form);
    try {
      const r = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: d.get("name"), email: d.get("email"), phone: d.get("phone"), service: d.get("service"),
        eventDate: d.get("eventDate"), requestType: tab, message: d.get("message") || "", website: d.get("website")
      }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Please try again.");
      setMessage("Thank you! Your request was saved. We will contact you after checking availability. This is not a confirmed booking.");
      setOk(true);
      form.reset();
    } catch (e) { setMessage(e instanceof Error ? e.message : "We could not send your enquiry."); }
    finally { setSending(false); }
  }
  return <div id="book" className="form-panel">
    <div className="form-tabs">
      <button className={tab === "booking" ? "selected" : ""} onClick={() => setTab("booking")} type="button">✦ Booking Request</button>
      <button className={tab === "enquiry" ? "selected" : ""} onClick={() => setTab("enquiry")} type="button">✉ General Enquiry</button>
    </div>
    <div className="form-inner">
      <p className="form-alert"><strong>Booking note:</strong> Requests are confirmed only after consultation, availability verification and any required advance payment.</p>
      <form onSubmit={send}>
        <div className="form-two">
          <label>Full name<input required autoComplete="name" name="name" placeholder="Your name" minLength={2} maxLength={100}/></label>
          <label>Phone number<input required autoComplete="tel" type="tel" name="phone" placeholder="+91" minLength={7} maxLength={20}/></label>
        </div>
        <label>Email address<input type="email" autoComplete="email" required name="email" placeholder="you@example.com"/></label>
        <div className="form-two">
          <label>Service<select required name="service" defaultValue=""><option value="" disabled>Select a service</option>{services.map(s => <option key={s}>{s}</option>)}</select></label>
          <label>Event date<input type="date" required={tab === "booking"} name="eventDate" min={new Date().toISOString().slice(0,10)}/></label>
        </div>
        <label>Tell us about your event<textarea name="message" rows={4} maxLength={1400} placeholder="Venue, occasion, and any details…"/></label>
        <div className="honeypot" aria-hidden="true"><label>Leave blank<input type="text" tabIndex={-1} name="website" autoComplete="off"/></label></div>
        <button className="pill form-submit" disabled={sending}>{sending ? "SENDING…" : "SEND " + (tab === "booking" ? "BOOKING REQUEST" : "ENQUIRY") + " ↗"}</button>
        {message && <p className={ok ? "feedback ok" : "feedback"} role="status">{message}</p>}
        <small>We only use your information to respond to your request.</small>
      </form>
    </div>
  </div>;
}
