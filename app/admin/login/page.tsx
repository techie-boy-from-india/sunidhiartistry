"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Sparkles } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), cache: "no-store"
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      router.replace("/admin");
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Login failed"); }
    finally { setBusy(false); }
  }
  return <main className="admin-login-screen">
    <section className="admin-login-panel">
      <div className="admin-login-brand"><span className="brand-dot">S</span><div><strong>Sunidhi Artistry</strong><small>PRIVATE BUSINESS PORTAL</small></div></div>
      <span className="admin-overline"><Sparkles size={15}/> WELCOME BACK</span>
      <h1>Your beauty business,<br/><em>beautifully organised.</em></h1>
      <p className="admin-muted">Sign in to review your booking requests, enquiries and customers.</p>
      <form onSubmit={submit} className="admin-login-form">
        <label>Email address<input type="email" required maxLength={255} value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" placeholder="owner@example.com"/></label>
        <label>Password<span className="admin-password-field"><input type={show ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password"/><button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>
        {error && <div className="admin-alert" role="alert">{error}</div>}
        <button className="admin-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in securely"}<ArrowRight size={18}/></button>
      </form>
      <div className="admin-login-note"><LockKeyhole size={15}/> Only authorised Sunidhi Artistry staff can access this portal.</div>
    </section>
    <section className="admin-login-visual" aria-hidden="true"><div className="login-visual-inner"><span>THE ART OF BEAUTY</span><p>For every moment<br/><em>worth remembering.</em></p><div>✦ &nbsp; SUNIDHI ARTISTRY</div></div></section>
  </main>;
}
