"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Mail, RefreshCcw, ShieldCheck } from "lucide-react";

export type NotificationRecord = {
  id:string; recipientEmail:string; subject:string; eventType:string;
  status:string; createdAt:string; lastError:string|null
};
type Props={
  records:NotificationRecord[];
  enabled:boolean;
  ownerAlertsEnabled:boolean;
  pending:number;
  failed:number;
  warning:string;
};
export default function NotificationCenter({records,enabled,ownerAlertsEnabled,pending,failed,warning}:Props) {
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState("");
  const [isError,setIsError]=useState(false);
  async function retry() {
    setBusy(true);setResult("");setIsError(false);
    try{
      const response=await fetch("/api/admin/notifications/dispatch",{method:"POST",headers:{"Content-Type":"application/json"}});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error || "Unable to process the queue");
      setResult(`Gmail SMTP accepted ${data.accepted} of ${data.attempted} attempted notification(s). Check the status list after refreshing.`);
      router.refresh();
    }catch(e){setIsError(true);setResult(e instanceof Error?e.message:"Unable to process queue");}
    finally{setBusy(false);}
  }
  return <section className="admin-panel notification-center">
    <div className="admin-panel-heading">
      <div><span className="admin-panel-subtitle">CUSTOMER COMMUNICATIONS</span><h2>Email activity & owner alerts</h2></div>
      <span className={"notification-pill "+(enabled?"on":"off")}>{enabled?"Automations active":"Setup required"}</span>
    </div>
    <p className="notification-hint">Customer update emails: <strong>{enabled ? "Active" : "Off"}</strong> · New booking/enquiry alerts to the owner: <strong>{ownerAlertsEnabled ? "Active" : "Off"}</strong>. Owner alerts require the Phase 5 database migration and a configured ADMIN_ALERT_EMAIL.</p>
    <div className="notification-summary">
      <div><Mail size={20}/><strong>{pending}</strong><span>Pending / in progress</span></div>
      <div><RefreshCcw size={20}/><strong>{failed}</strong><span>Needs retry</span></div>
      <div><CheckCircle2 size={20}/><strong>{records.filter(r=>r.status==="sent").length}</strong><span>Accepted (recent list)</span></div>
    </div>
    {warning && <p className="admin-alert" role="alert">{warning}</p>}
    {!enabled && <p className="notification-hint">Email notifications are currently switched off. Run the email database migration, enable Google 2-Step Verification and configure a Gmail App Password in Vercel before enabling.</p>}
    {enabled && <div className="notification-actions"><button type="button" onClick={retry} disabled={busy||(!pending&&!failed)}><RefreshCcw size={16}/>{busy?"Processing…":"Retry pending emails (up to 10)"}</button>
      <span><ShieldCheck size={16}/> Updates are sent only after an admin saves a real change.</span>
    </div>}
    {result && <p className={isError?"notification-result error":"notification-result success"} role="status">{result}</p>}
    {enabled && (records.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>RECIPIENT</th><th>MESSAGE</th><th>EVENT</th><th>STATUS</th><th>CREATED</th></tr></thead>
      <tbody>{records.map(row=><tr key={row.id}>
        <td><strong>{row.recipientEmail}</strong></td>
        <td><strong>{row.subject}</strong></td>
        <td><span className="notification-event">{row.eventType.replaceAll("_"," ")}</span></td>
        <td><span className={"notification-status status-"+row.status}>{row.status==="sent"?"Accepted":row.status}</span>{row.status==="failed"&&row.lastError&&<small className="notification-error">{row.lastError}</small>}</td>
        <td className="admin-cell-muted">{row.createdAt}</td>
      </tr>)}</tbody></table></div> : <div className="admin-empty"><Mail size={23}/><strong>No emails have been queued yet</strong><p>Change a test booking status to trigger your first notification.</p></div>)}
    <p className="notification-footer-note"><ArrowRight size={14}/> Accepted means the provider received the email request; delivery depends on the recipient mail server. Check the sending Gmail account’s Sent folder and any bounce messages.</p>
  </section>;
}
