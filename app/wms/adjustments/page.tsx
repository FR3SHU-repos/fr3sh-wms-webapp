"use client";

import React, { useState } from "react";
import { SlidersHorizontal, Plus, AlertTriangle, Shield } from "lucide-react";
import toast from "react-hot-toast";

const ADJUSTMENT_REASONS = [
  "Stock Damaged",
  "Stock Expired",
  "Manual Correction",
  "Theft / Loss",
  "Weight Difference",
  "QC Rejection",
  "Stock Reconciliation",
  "Other",
];

const SAMPLE_ADJUSTMENTS = [
  { id: "ADJ-2026-0031", product: "Organic Rice", sku: "FR3SH-A-0001", batch: "A-20260510-AA01", location: "Zone A / R2 / B3", before: 80, after: 75, diff: -5, unit: "kg", reason: "Weight Difference", user: "Priya (Auditor)", timestamp: "2026-06-24 14:20", approval: "Approved" },
  { id: "ADJ-2026-0030", product: "Organic Tomato", sku: "FR3SH-D-0080", batch: "D-20260610-BB02", location: "Zone D / R4 / B2", before: 30, after: 18, diff: -12, unit: "kg", reason: "Stock Damaged", user: "Ravi (Manager)", timestamp: "2026-06-24 11:05", approval: "Approved" },
  { id: "ADJ-2026-0029", product: "Cold-Pressed Groundnut Oil", sku: "FR3SH-L-0101", batch: "L-20260601-CC03", location: "Zone L / R1 / B1", before: 40, after: 0, diff: -40, unit: "litre", reason: "Stock Expired", user: "Anand (Admin)", timestamp: "2026-06-23 09:00", approval: "Pending" },
];

const APPROVAL_BADGE: Record<string, string> = {
  Approved: "bg-status-success-surface text-status-success",
  Pending: "bg-status-warning-surface text-status-warning",
  Rejected: "bg-status-danger-surface text-status-danger",
};

function NewAdjustmentModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ product: "", sku: "", batch: "", location: "", currentQty: "", newQty: "", unit: "kg", reason: "Manual Correction", notes: "" });

  const diff = Number(form.newQty) - Number(form.currentQty);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentQty || !form.newQty) { toast.error("Enter before and after quantities"); return; }
    toast.promise(
      fetch("/api/wms/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({
          skuId: form.sku,
          lotId: form.batch || undefined,
          locationId: form.location,
          quantity: String(diff),
          unit: form.unit,
          reason: form.reason,
          notes: form.notes,
        }),
      }).then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.message); return data; }),
      { loading: "Submitting adjustment…", success: "Adjustment submitted for approval", error: "Failed to submit" },
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-heading/40 backdrop-blur-sm p-4">
      <div className="bg-surface-card rounded-2xl border border-border w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground-heading flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> New Stock Adjustment
          </h2>
          <button onClick={onClose} className="text-foreground-muted text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="rounded-xl bg-status-warning-surface border border-status-warning/20 px-4 py-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-status-warning shrink-0 mt-0.5" />
            <p className="text-xs text-status-warning">Every adjustment is logged with your user ID and requires manager approval for differences above threshold.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Product *", key: "product" },
              { label: "Canonical SKU ID *", key: "sku" },
              { label: "Canonical lot ID", key: "batch" },
              { label: "Canonical location ID *", key: "location" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-foreground-muted mb-1">{f.label}</label>
                <input
                  value={(form as Record<string, string>)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Current Qty *</label>
              <input type="number" value={form.currentQty} onChange={(e) => setForm({ ...form, currentQty: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">New Qty *</label>
              <input type="number" value={form.newQty} onChange={(e) => setForm({ ...form, newQty: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" />
            </div>
          </div>
          {form.currentQty && form.newQty && (
            <div className={`rounded-xl px-4 py-2 text-sm font-medium ${diff < 0 ? "bg-status-danger-surface text-status-danger" : "bg-status-success-surface text-status-success"}`}>
              Difference: {diff > 0 ? "+" : ""}{diff} units
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Reason *</label>
            <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus">
              {ADJUSTMENT_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-3 border-t border-border pt-3">
            <button type="button" onClick={onClose} className="rounded-xl border border-border px-5 py-2 text-sm font-medium">Cancel</button>
            <button type="submit" className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover">Submit for Approval</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdjustmentsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
            <SlidersHorizontal className="h-6 w-6 text-primary" /> Stock Adjustments
          </h1>
          <p className="text-sm text-foreground-muted mt-1">Admin-controlled stock corrections with full audit trail</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-hover">
          <Plus className="h-4 w-4" /> New Adjustment
        </button>
      </div>

      <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-foreground-muted">
                {["Adj ID", "Product", "Batch", "Location", "Before", "After", "Diff", "Reason", "By", "Timestamp", "Approval"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SAMPLE_ADJUSTMENTS.map((a) => (
                <tr key={a.id} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{a.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground-heading whitespace-nowrap">{a.product}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{a.batch}</td>
                  <td className="px-4 py-3 text-foreground-body">{a.location}</td>
                  <td className="px-4 py-3">{a.before} {a.unit}</td>
                  <td className="px-4 py-3">{a.after} {a.unit}</td>
                  <td className={`px-4 py-3 font-bold ${a.diff < 0 ? "text-status-danger" : "text-status-success"}`}>{a.diff > 0 ? "+" : ""}{a.diff}</td>
                  <td className="px-4 py-3 text-foreground-body">{a.reason}</td>
                  <td className="px-4 py-3 text-foreground-muted text-xs">{a.user}</td>
                  <td className="px-4 py-3 text-foreground-muted text-xs">{a.timestamp}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${APPROVAL_BADGE[a.approval] ?? ""}`}>{a.approval}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <NewAdjustmentModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
