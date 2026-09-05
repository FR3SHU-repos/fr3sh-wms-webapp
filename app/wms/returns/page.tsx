"use client";

import React, { useEffect, useState } from "react";
import { RotateCcw, Plus, Camera } from "lucide-react";
import toast from "react-hot-toast";

const RETURN_REASONS = ["Damaged", "Wrong item", "Expired", "Quality issue", "Customer rejected", "Delivery failed"];
const RETURN_ACTIONS = ["Restock", "Mark as Damaged", "Dispose", "Farmer Claim", "Further Inspection"];

const SAMPLE_RETURNS = [
  { id: "RET-2026-0021", orderId: "FR1010", customer: "Deepa Menon", product: "Organic Rice", batch: "A-20260610-XX01", reason: "Quality issue", inspectionResult: "Partially Acceptable", finalAction: "Restock", status: "Restocked", refund: "Issued" },
  { id: "RET-2026-0020", orderId: "FR1008", customer: "Suresh Babu", product: "Organic Tomato", batch: "D-20260615-YY02", reason: "Damaged", inspectionResult: "Fully Damaged", finalAction: "Dispose", status: "Pending Inspection", refund: "Pending" },
  { id: "RET-2026-0019", orderId: "FR1006", customer: "Priti Jain", product: "Cold-Pressed Coconut Oil", batch: "L-20260601-ZZ03", reason: "Wrong item", inspectionResult: "Good", finalAction: "Restock", status: "Completed", refund: "Replacement Sent" },
];

const STATUS_BADGE: Record<string, string> = {
  "Pending Inspection": "bg-status-warning-surface text-status-warning",
  Restocked: "bg-status-success-surface text-status-success",
  Completed: "bg-tertiary text-tertiary-foreground",
  Disposed: "bg-status-danger-surface text-status-danger",
};

function NewReturnModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ dispatchId: "", skuId: "", lotId: "", quantity: "1", unit: "piece", quarantineLocationId: "", reason: "Damaged", finalAction: "Further Inspection", notes: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/wms/returns", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify(form) });
    if (!res.ok) { toast.error((await res.json()).message ?? "Return failed"); return; }
    toast.success("Return registered in quarantine"); onSuccess(); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-heading/40 backdrop-blur-sm p-4">
      <div className="bg-surface-card rounded-2xl border border-border w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground-heading">New Return Entry</h2>
          <button onClick={onClose} className="text-foreground-muted text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Dispatch ID *", key: "dispatchId", placeholder: "DISP-..." },
              { label: "Canonical SKU ID *", key: "skuId", placeholder: "24-character ID" },
              { label: "Lot ID", key: "lotId", placeholder: "Canonical lot ID" },
              { label: "Quarantine Location ID *", key: "quarantineLocationId", placeholder: "Canonical location ID" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-foreground-muted mb-1">{f.label}</label>
                <input
                  required={f.label.endsWith("*")}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Return Reason *</label>
              <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus">
                {RETURN_REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus">
                {["piece", "kg", "g", "litre", "ml", "pack", "box"].map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Quantity</label>
            <input required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
              placeholder="e.g. Partially Acceptable" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none resize-none" />
          </div>
          <button type="button" className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-secondary-subtle">
            <Camera className="h-4 w-4" /> Add Return Photos
          </button>
          <div className="flex justify-end gap-3 border-t border-border pt-3">
            <button type="button" onClick={onClose} className="rounded-xl border border-border px-5 py-2 text-sm font-medium hover:bg-surface">Cancel</button>
            <button type="submit" className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover">Submit Return</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReturnsPage() {
  const [showModal, setShowModal] = useState(false);
  const [returns, setReturns] = useState(SAMPLE_RETURNS.slice(0, 0));
  const load = () => fetch("/api/wms/returns", { cache: "no-store" }).then(r => r.json()).then(x => { if (x.success) setReturns(x.data.map((r: any) => ({ id: r.returnId, orderId: r.dispatchId, customer: "", product: r.line?.product ?? r.line?.skuCode, batch: r.line?.lotId ?? "", reason: r.reason, inspectionResult: "Pending QC", finalAction: r.disposition, status: "Pending Inspection", refund: "Not applicable" }))); }).catch(() => toast.error("Returns service unavailable"));
  useEffect(() => { void load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-primary" /> Returns Management
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Flow: Return Received → Inspection → Restock / Damage / Dispose / Farmer Claim
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-hover">
          <Plus className="h-4 w-4" /> New Return
        </button>
      </div>

      <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-foreground-muted">
                {["Return ID", "Order", "Customer", "Product", "Batch", "Reason", "Inspection", "Final Action", "Status", "Refund"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {returns.map((r) => (
                <tr key={r.id} className="hover:bg-surface transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{r.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground-heading">{r.orderId}</td>
                  <td className="px-4 py-3 text-foreground-body">{r.customer}</td>
                  <td className="px-4 py-3 text-foreground-heading">{r.product}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{r.batch}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-status-warning-surface text-status-warning px-2 py-0.5 text-xs font-medium">{r.reason}</span></td>
                  <td className="px-4 py-3 text-foreground-body">{r.inspectionResult}</td>
                  <td className="px-4 py-3 font-medium text-foreground-body">{r.finalAction}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status] ?? ""}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground-body">{r.refund}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <NewReturnModal onClose={() => setShowModal(false)} onSuccess={load} />}
    </div>
  );
}
