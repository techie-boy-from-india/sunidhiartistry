"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, LayoutDashboard, LogOut, Mail, Menu, MessageCircle, Search, Sparkles, UserRound, Users, X } from "lucide-react";

export type AdminStats = { totalEnquiries: number; newEnquiries: number; totalBookings: number; pendingBookings: number; confirmedBookings: number; customers: number };
export type BookingRow = { id: string; status: string; name: string; email: string; phone: string; service: string; eventDate: string | null; message: string; createdAt: string };
export type EnquiryRow = BookingRow & { requestType: string };
export type CustomerRow = { email: string; name: string; phone: string; requestCount: number; lastContact: string };
type Props = { tab: string; stats: AdminStats; bookings: BookingRow[]; enquiries: EnquiryRow[]; customers: CustomerRow[]; count: number; page: number; pageSize: number; q: string; status: string; setupError: string };
const navigation = [
  { key: "overview", text: "Overview", icon: LayoutDashboard },
  { key: "bookings", text: "Bookings", icon: CalendarDays },
  { key: "enquiries", text: "Enquiries", icon: MessageCircle },
  { key: "customers", text: "Customers", icon: Users }
];
function Badge({ status }: { status: string }) { return <span className={"admin-badge badge-" + status}>{status.replace(/\b\w/g, c => c.toUpperCase())}</span>; }
function Person({ name, email, phone }: { name: string; email: string; phone: string }) {
  return <div className="admin-person"><div className="admin-avatar">{(name || "?")[0].toUpperCase()}</div><div><strong>{name}</strong><span>{email}</span><a href={"tel:" + phone.replace(/[^+\d]/g, "")}>{phone}</a></div></div>;
}
function NoRows({ message }: { message: string }) { return <div className="admin-empty"><Sparkles size={25}/><strong>Nothing here yet</strong><p>{message}</p></div>; }

export default function AdminDashboard({ tab, stats, bookings, enquiries, customers, count, page, pageSize, q, status, setupError }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(q);
  const [busy, setBusy] = useState("");
  const [feedback, setFeedback] = useState("");
  const [open, setOpen] = useState(false);
  function link(nextTab = tab, nextPage = 1, nextQuery = q, nextStatus = status) {
    const params = new URLSearchParams();
    params.set("tab", nextTab);
    if (nextPage > 1) params.set("page", String(nextPage));
    if (nextQuery) params.set("q", nextQuery);
    if (nextStatus !== "all") params.set("status", nextStatus);
    return "/admin?" + params.toString();
  }
  async function update(kind: "bookings" | "enquiries", id: string, next: string) {
    if (kind === "bookings" && next === "confirmed" && !window.confirm("Confirm only after checking availability, consultation and any required deposit. Continue?")) return;
    setBusy(kind + id); setFeedback("");
    try {
      const response = await fetch(`/api/admin/${kind}/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }), cache: "no-store" });
      const data = await response.json();
      if (response.status === 401) { router.replace("/admin/login"); return; }
      if (!response.ok) throw new Error(data.error || "Update failed");
      setFeedback("Status updated successfully.");
      router.refresh();
    } catch (error) { setFeedback(error instanceof Error ? error.message : "Could not save changes"); }
    finally { setBusy(""); }
  }
  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => undefined);
    router.replace("/admin/login"); router.refresh();
  }
  const tabTitle = ({ overview: "Your business at a glance", bookings: "Booking management", enquiries: "Enquiry inbox", customers: "Your customers" } as Record<string,string>)[tab];
  const statusOptions = tab === "bookings" ? ["all","pending","confirmed","completed","cancelled"] : ["all","new","contacted","quoted","converted","lost"];
  const format = (row: BookingRow) => row.eventDate ? new Date(row.eventDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not provided";
  function tableBookings(rows: BookingRow[]) {
    if (!rows.length) return <NoRows message="Booking requests will appear here as customers submit them."/>;
    return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>CLIENT</th><th>SERVICE / EVENT</th><th>RECEIVED</th><th>STATUS</th><th>CONTACT</th></tr></thead>
    <tbody>{rows.map(b => <tr key={b.id}>
      <td><Person name={b.name} email={b.email} phone={b.phone}/></td>
      <td><strong>{b.service}</strong><span>{format(b)}</span>{b.message && <details className="admin-details"><summary>View notes</summary><p>{b.message}</p></details>}</td>
      <td className="admin-cell-muted">{b.createdAt}</td>
      <td><Badge status={b.status}/><select aria-label={"Update booking status for " + b.name} className="admin-status-select" value={b.status} disabled={busy === "bookings" + b.id} onChange={e => update("bookings", b.id, e.target.value)}>{["pending","confirmed","completed","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}</select></td>
      <td><a className="admin-mail" href={"mailto:" + b.email}><Mail size={17}/></a></td>
    </tr>)}</tbody></table></div>;
  }
  function tableEnquiries(rows: EnquiryRow[]) {
    if (!rows.length) return <NoRows message="Customer questions and new leads will show up here."/>;
    return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>CLIENT</th><th>ENQUIRY</th><th>RECEIVED</th><th>FOLLOW-UP STATUS</th><th>CONTACT</th></tr></thead>
    <tbody>{rows.map(e => <tr key={e.id}>
      <td><Person name={e.name} email={e.email} phone={e.phone}/></td>
      <td><strong>{e.service}</strong><span>{e.requestType === "booking" ? "Booking request" : "General enquiry"} · {format(e)}</span>{e.message && <details className="admin-details"><summary>View message</summary><p>{e.message}</p></details>}</td>
      <td className="admin-cell-muted">{e.createdAt}</td>
      <td><Badge status={e.status}/><select aria-label={"Update enquiry status for " + e.name} className="admin-status-select" value={e.status} disabled={busy === "enquiries" + e.id} onChange={ev => update("enquiries", e.id, ev.target.value)}>{["new","contacted","quoted","converted","lost"].map(s => <option key={s} value={s}>{s}</option>)}</select></td>
      <td><a className="admin-mail" href={"mailto:" + e.email}><Mail size={17}/></a></td>
    </tr>)}</tbody></table></div>;
  }
  return <div className="admin-shell">
    <aside className={"admin-sidebar " + (open ? "admin-sidebar-open" : "")}>
      <div className="admin-sidebar-top"><span className="brand-dot">S</span><div><strong>Sunidhi Artistry</strong><small>OWNER WORKSPACE</small></div><button className="admin-side-close" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={19}/></button></div>
      <div className="admin-sidebar-label">WORKSPACE</div>
      <nav aria-label="Admin pages">{navigation.map(({key,text,icon:Icon}) => <Link key={key} className={"admin-nav-link " + (tab === key ? "active" : "")} href={link(key,1,"","all")} onClick={() => {setOpen(false);setSearch("");}}><Icon size={19}/>{text}{key === "bookings" && stats.pendingBookings > 0 && <span className="admin-count">{stats.pendingBookings}</span>}{key === "enquiries" && stats.newEnquiries > 0 && <span className="admin-count">{stats.newEnquiries}</span>}</Link>)}</nav>
      <div className="admin-sidebar-bottom"><span><CheckCircle2 size={16}/> PRIVATE & SECURE</span><button onClick={logout}><LogOut size={18}/> Sign out</button></div>
    </aside>
    {open && <button className="admin-sidebar-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)}/>}
    <div className="admin-main">
      <header className="admin-topbar"><button className="admin-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={22}/></button><div className="admin-breadcrumb">Sunidhi Artistry <span>/</span> {tab.charAt(0).toUpperCase() + tab.slice(1)}</div><a href="/" target="_blank" rel="noopener noreferrer" className="admin-open-site">View website <ArrowRight size={16}/></a><span className="admin-top-avatar">S</span></header>
      <div className="admin-body">
        <div className="admin-heading"><div><div className="admin-overline"><Sparkles size={15}/> THE BUSINESS STUDIO</div><h1>{tabTitle}</h1><p>Manage your appointments, leads and customer relationships in one place.</p></div><span className="admin-live"><span/> Live workspace</span></div>
        {setupError && <div className="admin-alert" role="alert">{setupError}</div>}
        {feedback && <div className="admin-toast" role="status">{feedback}<button onClick={() => setFeedback("")} aria-label="Dismiss message"><X size={14}/></button></div>}
        <section className="admin-stats" aria-label="Business summary">
          <div className="admin-stat"><div><span>TOTAL BOOKINGS</span><CalendarDays size={19}/></div><strong>{stats.totalBookings}</strong><small>Booking requests received</small></div>
          <div className="admin-stat"><div><span>AWAITING REVIEW</span><Clock3 size={19}/></div><strong>{stats.pendingBookings}</strong><small>Pending booking decisions</small></div>
          <div className="admin-stat"><div><span>NEW ENQUIRIES</span><MessageCircle size={19}/></div><strong>{stats.newEnquiries}</strong><small>Need a follow-up</small></div>
          <div className="admin-stat"><div><span>CUSTOMERS</span><Users size={19}/></div><strong>{stats.customers}</strong><small>Unique customer emails</small></div>
        </section>
        {tab === "overview" ? <>
          <section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-panel-subtitle">BOOKINGS</span><h2>Appointments to review</h2></div><Link href={link("bookings",1,"","all")}>View all bookings <ArrowRight size={17}/></Link></div>{tableBookings(bookings)}</section>
          <section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-panel-subtitle">ENQUIRIES</span><h2>Latest customer messages</h2></div><Link href={link("enquiries",1,"","all")}>View all enquiries <ArrowRight size={17}/></Link></div>{tableEnquiries(enquiries)}</section>
        </> : <>
          <form className="admin-filterbar" onSubmit={e => {e.preventDefault();router.push(link(tab,1,search,status));}}>
            <label><Search size={18}/><input type="search" value={search} onChange={e => setSearch(e.target.value)} maxLength={80} placeholder="Search name, email, phone or service…" aria-label="Search records"/></label>
            {tab !== "customers" && <select aria-label="Filter by status" value={statusOptions.includes(status) ? status : "all"} onChange={e => router.push(link(tab,1,q,e.target.value))}>{statusOptions.map(s => <option key={s} value={s}>{s === "all" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}</option>)}</select>}
            <button type="submit">Search</button>{(q || status !== "all") && <Link href={link(tab,1,"","all")} className="admin-reset">Clear</Link>}
          </form>
          <section className="admin-panel">
            <div className="admin-panel-heading"><div><span className="admin-panel-subtitle">{count} RECORDS</span><h2>{tabTitle}</h2></div></div>
            {tab === "bookings" && tableBookings(bookings)}
            {tab === "enquiries" && tableEnquiries(enquiries)}
            {tab === "customers" && (customers.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>CUSTOMER</th><th>REQUESTS</th><th>LAST CONTACT</th><th>REACH OUT</th></tr></thead><tbody>{customers.map(c => <tr key={c.email}><td><Person name={c.name} email={c.email} phone={c.phone}/></td><td>{c.requestCount}</td><td className="admin-cell-muted">{c.lastContact}</td><td><a className="admin-mail" href={"mailto:" + c.email}><Mail size={17}/></a></td></tr>)}</tbody></table></div> : <NoRows message="Customer records will be created when someone submits an enquiry or booking request."/>)}
            {count > pageSize && <div className="admin-paging"><span>Page {page} of {Math.ceil(count / pageSize)}</span><div>{page > 1 && <Link href={link(tab,page-1)}><ChevronLeft size={16}/> Previous</Link>}{page * pageSize < count && <Link href={link(tab,page+1)}>Next <ChevronRight size={16}/></Link>}</div></div>}
          </section>
        </>}
        <div className="admin-footnote"><UserRound size={15}/> Booking confirmations are manual. Verify availability and payment before marking a request as confirmed.</div>
      </div>
    </div>
  </div>;
}
