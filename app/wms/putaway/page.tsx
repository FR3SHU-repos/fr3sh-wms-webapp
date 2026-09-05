"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function PutawayPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [form, setForm] = useState({ qcId: "", destinationLocationId: "", quantity: "" });
  const load = () => fetch("/api/wms/putaway", { cache: "no-store" }).then(r => r.json()).then(x => x.success && setTasks(x.data ?? [])).catch(() => toast.error("Putaway service unavailable"));
  useEffect(() => { void load(); }, []);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); const r = await fetch("/api/wms/putaway", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify(form) }); if (!r.ok) { toast.error((await r.json()).message ?? "Putaway failed"); return; } toast.success("Accepted stock moved to storage"); setForm({ qcId: "", destinationLocationId: "", quantity: "" }); load(); };
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Putaway</h1><p className="text-sm text-foreground-muted">Move QC-accepted stock from staging into storage.</p></div><form onSubmit={submit} className="grid gap-3 rounded-2xl border border-border bg-surface-card p-5 md:grid-cols-4"><input required placeholder="QC ID" value={form.qcId} onChange={e=>setForm({...form,qcId:e.target.value})} className="rounded-xl border p-2"/><input required placeholder="Destination location ID" value={form.destinationLocationId} onChange={e=>setForm({...form,destinationLocationId:e.target.value})} className="rounded-xl border p-2"/><input required placeholder="Quantity" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} className="rounded-xl border p-2"/><button className="rounded-xl bg-primary px-4 py-2 text-primary-foreground">Put away</button></form><div className="rounded-2xl border border-border bg-surface-card"><table className="w-full text-sm"><thead><tr><th className="p-3 text-left">Task</th><th>QC</th><th>Status</th><th>Destination</th></tr></thead><tbody>{tasks.map(t=><tr key={t.taskId} className="border-t"><td className="p-3">{t.taskId}</td><td>{t.qcId}</td><td>{t.status}</td><td>{t.destinationLocationId}</td></tr>)}</tbody></table></div></div>;
}
