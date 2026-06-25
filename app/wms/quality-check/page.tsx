"use client";

import React, { useState } from "react";
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, Camera } from "lucide-react";
import toast from "react-hot-toast";

const QC_QUEUE = [
  { id: "QC-2026-0041", inwardId: "INW-2026-0041", product: "Organic Turmeric", farmer: "Ramaiah FPO", batch: "I-20260625-A1B2", qty: "200 kg", receivedDate: "2026-06-25", priority: "High" },
  { id: "QC-2026-0038", inwardId: "INW-2026-0038", product: "Cold-Pressed Coconut Oil", farmer: "Kavitha Organics", batch: "L-20260625-C3D4", qty: "60 L", receivedDate: "2026-06-25", priority: "Normal" },
  { id: "QC-2026-0034", inwardId: "INW-2026-0034", product: "Organic Spinach", farmer: "Leafy Greens FPO", batch: "E-20260624-E5F6", qty: "40 kg", receivedDate: "2026-06-24", priority: "High" },
];

const QC_RESULTS = ["Accepted", "Partially Accepted", "Rejected"];

function QCModal({ item, onClose }: { item: typeof QC_QUEUE[0]; onClose: () => void }) {
  const [form, setForm] = useState({
    moistureLevel: "",
    foreignMaterial: "None",
    damagePercentage: "0",
    smell: "Fresh",
    color: "Good",
    sizeGrade: "A",
    organicCertCheck: true,
    labTestRequired: false,
    acceptedQty: item.qty.replace(/[^0-9]/g, ""),
    rejectedQty: "0",
    rejectionReason: "",
    qcNotes: "",
    result: "Accepted",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.promise(
      fetch("/api/wms/quality-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inwardId: item.inwardId, batchId: item.batch, ...form }),
      }).then((r) => r.json()),
      {
        loading: "Saving QC result…",
        success: `QC completed — ${form.result}`,
        error: "Failed to save QC",
      },
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-heading/40 backdrop-blur-sm p-4">
      <div className="bg-surface-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-bold text-foreground-heading">Quality Check — {item.id}</h2>
            <p className="text-xs text-foreground-muted mt-0.5">{item.product} · {item.batch}</p>
          </div>
          <button onClick={onClose} className="text-foreground-muted hover:text-foreground-heading text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Moisture Level (%)", key: "moistureLevel", type: "text", placeholder: "e.g. 12%" },
              { label: "Foreign Material", key: "foreignMaterial", type: "select", options: ["None", "Minimal", "Moderate", "High"] },
              { label: "Damage %", key: "damagePercentage", type: "number" },
              { label: "Smell / Freshness", key: "smell", type: "select", options: ["Fresh", "Mild Odour", "Stale", "Fermented"] },
              { label: "Color", key: "color", type: "select", options: ["Good", "Slightly Off", "Poor"] },
              { label: "Size / Grade", key: "sizeGrade", type: "select", options: ["A", "B", "C", "Mixed", "Reject"] },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-foreground-muted mb-1">{f.label}</label>
                {f.type === "select" ? (
                  <select
                    value={(form as unknown as Record<string, string>)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                  >
                    {f.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    value={(form as unknown as Record<string, string>)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.organicCertCheck} onChange={(e) => setForm({ ...form, organicCertCheck: e.target.checked })}
                className="rounded border-border text-primary" />
              <span className="text-sm text-foreground-body">Organic certificate verified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.labTestRequired} onChange={(e) => setForm({ ...form, labTestRequired: e.target.checked })}
                className="rounded border-border text-primary" />
              <span className="text-sm text-foreground-body">Lab test required</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Accepted Qty (kg/unit)</label>
              <input type="number" value={form.acceptedQty} onChange={(e) => setForm({ ...form, acceptedQty: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Rejected Qty (kg/unit)</label>
              <input type="number" value={form.rejectedQty} onChange={(e) => setForm({ ...form, rejectedQty: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Rejection Reason (if any)</label>
            <input value={form.rejectionReason} onChange={(e) => setForm({ ...form, rejectionReason: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
              placeholder="Describe defects or contamination" />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">QC Notes</label>
            <textarea rows={2} value={form.qcNotes} onChange={(e) => setForm({ ...form, qcNotes: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus resize-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-2">QC Result *</label>
            <div className="flex gap-3 flex-wrap">
              {QC_RESULTS.map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="result" value={r} checked={form.result === r} onChange={() => setForm({ ...form, result: r })}
                    className="text-primary border-border" />
                  <span className="text-sm font-medium text-foreground-body">{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-secondary-subtle">
              <Camera className="h-4 w-4" /> Add QC Photos
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="rounded-xl border border-border px-5 py-2 text-sm font-medium hover:bg-surface">Cancel</button>
            <button type="submit" className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover">
              Submit QC
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function QualityCheckPage() {
  const [selected, setSelected] = useState<typeof QC_QUEUE[0] | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" /> Quality Check
        </h1>
        <p className="text-sm text-foreground-muted mt-1">Inspect and verify incoming organic produce before putaway</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "QC Pending", value: QC_QUEUE.length, icon: AlertTriangle, color: "text-status-warning", bg: "bg-status-warning-surface" },
          { label: "Accepted Today", value: 14, icon: CheckCircle2, color: "text-status-success", bg: "bg-status-success-surface" },
          { label: "Rejected Today", value: 2, icon: XCircle, color: "text-status-danger", bg: "bg-status-danger-surface" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface-card border border-border p-5 flex items-center gap-4">
            <div className={`rounded-xl p-2.5 ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-foreground-muted font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-foreground-heading">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground-heading">QC Queue</h2>
        </div>
        <div className="divide-y divide-border">
          {QC_QUEUE.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground-heading">{item.product}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.priority === "High" ? "bg-status-danger-surface text-status-danger" : "bg-surface text-foreground-muted"}`}>
                    {item.priority}
                  </span>
                </div>
                <p className="text-sm text-foreground-muted mt-0.5">
                  {item.farmer} · {item.qty} · Batch: <span className="font-mono">{item.batch}</span>
                </p>
                <p className="text-xs text-foreground-muted">Received: {item.receivedDate} · Inward: {item.inwardId}</p>
              </div>
              <button
                onClick={() => setSelected(item)}
                className="shrink-0 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary-hover"
              >
                Start QC
              </button>
            </div>
          ))}
        </div>
      </div>

      {selected && <QCModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
