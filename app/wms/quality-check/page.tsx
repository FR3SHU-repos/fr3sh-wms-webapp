"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, Camera, RefreshCw, Clock } from "lucide-react";
import toast from "react-hot-toast";

const QC_RESULTS = ["Accepted", "Partially Accepted", "Rejected"] as const;
type QCResult = (typeof QC_RESULTS)[number];

interface InwardEntry {
  _id: string;
  entryId: string;
  productName: string;
  farmerName: string;
  batchId: string;
  quantityReceived: number;
  unit: string;
  skuCode?: string;
  receivedDate: string;
  harvestDate?: string;
  transportCondition?: string;
  notes?: string;
  status: string;
}

interface QCStats {
  acceptedToday: number;
  rejectedToday: number;
  partialToday: number;
}

function getPriority(entry: InwardEntry): "High" | "Normal" {
  const hoursAgo = (Date.now() - new Date(entry.receivedDate).getTime()) / 3600000;
  if (hoursAgo > 6) return "High";
  if (entry.transportCondition && entry.transportCondition !== "Good") return "High";
  return "Normal";
}

function QCModal({
  entry,
  onClose,
  onSuccess,
}: {
  entry: InwardEntry;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    moistureLevel: "",
    foreignMaterial: "None",
    damagePercentage: "0",
    smell: "Fresh",
    color: "Good",
    sizeGrade: "A",
    organicCertCheck: true,
    labTestRequired: false,
    acceptedQty: String(entry.quantityReceived),
    rejectedQty: "0",
    rejectionReason: "",
    qcNotes: "",
    result: "Accepted" as QCResult,
  });
  const [submitting, setSubmitting] = useState(false);

  // Auto-adjust accepted/rejected qty when result changes
  const handleResultChange = (result: QCResult) => {
    if (result === "Rejected") {
      setForm((f) => ({ ...f, result, acceptedQty: "0", rejectedQty: String(entry.quantityReceived) }));
    } else if (result === "Accepted") {
      setForm((f) => ({ ...f, result, acceptedQty: String(entry.quantityReceived), rejectedQty: "0" }));
    } else {
      setForm((f) => ({ ...f, result }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accepted = Number(form.acceptedQty);
    const rejected = Number(form.rejectedQty);
    if (accepted + rejected > entry.quantityReceived) {
      toast.error("Accepted + Rejected qty cannot exceed received qty");
      return;
    }
    if (form.result === "Rejected" && !form.rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/wms/quality-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inwardId: entry.entryId,
          batchId: entry.batchId,
          productName: entry.productName,
          ...form,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const resultLabel =
          form.result === "Accepted"
            ? "✅ Accepted"
            : form.result === "Rejected"
              ? "❌ Rejected"
              : "⚠️ Partially Accepted";
        toast.success(`QC done — ${resultLabel} · ${entry.productName}`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.message ?? "Failed to save QC");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const RESULT_STYLES: Record<QCResult, string> = {
    Accepted: "border-status-success bg-status-success-surface text-status-success",
    "Partially Accepted": "border-status-warning bg-status-warning-surface text-status-warning",
    Rejected: "border-status-danger bg-status-danger-surface text-status-danger",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-heading/40 backdrop-blur-sm p-4">
      <div className="bg-surface-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-bold text-foreground-heading text-base">
              Quality Check — {entry.entryId}
            </h2>
            <p className="text-xs text-foreground-muted mt-0.5">
              {entry.productName} · Batch: <span className="font-mono">{entry.batchId}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-foreground-muted hover:text-foreground-heading text-xl">×</button>
        </div>

        {/* Entry summary strip */}
        <div className="mx-6 mt-4 rounded-xl bg-secondary-subtle border border-border px-4 py-3 grid grid-cols-3 gap-3 text-xs">
          <div>
            <p className="text-foreground-muted font-medium">Farmer</p>
            <p className="text-foreground-heading font-semibold mt-0.5">{entry.farmerName}</p>
          </div>
          <div>
            <p className="text-foreground-muted font-medium">Received Qty</p>
            <p className="text-foreground-heading font-semibold mt-0.5">{entry.quantityReceived} {entry.unit}</p>
          </div>
          <div>
            <p className="text-foreground-muted font-medium">Received On</p>
            <p className="text-foreground-heading font-semibold mt-0.5">
              {new Date(entry.receivedDate).toLocaleDateString("en-IN")}
            </p>
          </div>
          {entry.skuCode && (
            <div>
              <p className="text-foreground-muted font-medium">SKU</p>
              <p className="font-mono text-primary font-semibold mt-0.5">{entry.skuCode}</p>
            </div>
          )}
          {entry.transportCondition && (
            <div>
              <p className="text-foreground-muted font-medium">Transport</p>
              <p className={`font-semibold mt-0.5 ${entry.transportCondition !== "Good" ? "text-status-warning" : "text-status-success"}`}>
                {entry.transportCondition}
              </p>
            </div>
          )}
          {entry.harvestDate && (
            <div>
              <p className="text-foreground-muted font-medium">Harvest Date</p>
              <p className="text-foreground-heading font-semibold mt-0.5">
                {new Date(entry.harvestDate).toLocaleDateString("en-IN")}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Moisture Level (%)", key: "moistureLevel", type: "text", placeholder: "e.g. 12" },
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
              <input type="checkbox" checked={form.organicCertCheck}
                onChange={(e) => setForm({ ...form, organicCertCheck: e.target.checked })}
                className="rounded border-border text-primary" />
              <span className="text-sm text-foreground-body">Organic certificate verified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.labTestRequired}
                onChange={(e) => setForm({ ...form, labTestRequired: e.target.checked })}
                className="rounded border-border text-primary" />
              <span className="text-sm text-foreground-body">Lab test required</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">
                Accepted Qty ({entry.unit})
              </label>
              <input type="number" min="0" step="0.01" value={form.acceptedQty}
                onChange={(e) => setForm({ ...form, acceptedQty: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">
                Rejected Qty ({entry.unit})
              </label>
              <input type="number" min="0" step="0.01" value={form.rejectedQty}
                onChange={(e) => setForm({ ...form, rejectedQty: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" />
            </div>
          </div>

          {(form.result === "Rejected" || form.result === "Partially Accepted") && (
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">
                Rejection Reason {form.result === "Rejected" ? "*" : ""}
              </label>
              <input
                required={form.result === "Rejected"}
                value={form.rejectionReason}
                onChange={(e) => setForm({ ...form, rejectionReason: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                placeholder="Describe defects or contamination" />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">QC Notes</label>
            <textarea rows={2} value={form.qcNotes} onChange={(e) => setForm({ ...form, qcNotes: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus resize-none" />
          </div>

          {/* QC Result selector */}
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-2">QC Result *</label>
            <div className="grid grid-cols-3 gap-2">
              {QC_RESULTS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleResultChange(r)}
                  className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all text-center ${
                    form.result === r
                      ? RESULT_STYLES[r]
                      : "border-border bg-surface text-foreground-muted hover:bg-secondary-subtle"
                  }`}
                >
                  {r === "Accepted" && "✅ "}
                  {r === "Partially Accepted" && "⚠️ "}
                  {r === "Rejected" && "❌ "}
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button"
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-secondary-subtle">
              <Camera className="h-4 w-4" /> Add QC Photos
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-border px-5 py-2 text-sm font-medium hover:bg-surface">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover disabled:opacity-60">
              {submitting ? "Saving…" : "Submit QC"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function QualityCheckPage() {
  const [selected, setSelected] = useState<InwardEntry | null>(null);
  const [queue, setQueue] = useState<InwardEntry[]>([]);
  const [stats, setStats] = useState<QCStats>({ acceptedToday: 0, rejectedToday: 0, partialToday: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [queueRes, statsRes] = await Promise.all([
        fetch("/api/wms/inward?status=QC%20Pending&limit=100"),
        fetch("/api/wms/quality-check?stats=true"),
      ]);
      const [queueData, statsData] = await Promise.all([queueRes.json(), statsRes.json()]);
      if (queueData.success) setQueue(queueData.data);
      if (statsData.success) setStats(statsData);
    } catch {
      toast.error("Failed to load QC data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleQCSuccess = () => {
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" /> Quality Check
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Inspect and verify incoming organic produce before putaway
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-foreground-muted hover:bg-secondary-subtle"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "QC Pending",
            value: loading ? "…" : queue.length,
            icon: AlertTriangle,
            color: "text-status-warning",
            bg: "bg-status-warning-surface",
          },
          {
            label: "Accepted Today",
            value: loading ? "…" : stats.acceptedToday + stats.partialToday,
            icon: CheckCircle2,
            color: "text-status-success",
            bg: "bg-status-success-surface",
          },
          {
            label: "Rejected Today",
            value: loading ? "…" : stats.rejectedToday,
            icon: XCircle,
            color: "text-status-danger",
            bg: "bg-status-danger-surface",
          },
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

      {/* QC Queue */}
      <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground-heading">QC Queue</h2>
          {!loading && queue.length > 0 && (
            <span className="text-xs text-foreground-muted">{queue.length} item{queue.length !== 1 ? "s" : ""} waiting</span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-foreground-muted">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            Loading queue…
          </div>
        ) : queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-foreground-muted gap-2">
            <CheckCircle2 className="h-10 w-10 text-status-success opacity-60" />
            <p className="font-medium text-foreground-heading">All clear!</p>
            <p className="text-sm">No inward entries pending quality check.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {queue.map((entry) => {
              const priority = getPriority(entry);
              const hoursAgo = Math.floor((Date.now() - new Date(entry.receivedDate).getTime()) / 3600000);
              const waitLabel = hoursAgo === 0 ? "Just received" : hoursAgo === 1 ? "1 hour ago" : `${hoursAgo}h ago`;

              return (
                <div key={entry._id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground-heading">{entry.productName}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        priority === "High"
                          ? "bg-status-danger-surface text-status-danger"
                          : "bg-surface text-foreground-muted border border-border"
                      }`}>
                        {priority}
                      </span>
                      {entry.skuCode && (
                        <span className="font-mono text-xs text-primary">{entry.skuCode}</span>
                      )}
                    </div>
                    <p className="text-sm text-foreground-muted mt-0.5">
                      {entry.farmerName} · {entry.quantityReceived} {entry.unit} · Batch:{" "}
                      <span className="font-mono">{entry.batchId}</span>
                    </p>
                    <p className="text-xs text-foreground-muted flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {waitLabel} · Inward: <span className="font-mono">{entry.entryId}</span>
                      {entry.transportCondition && entry.transportCondition !== "Good" && (
                        <span className="ml-1 text-status-warning font-medium">
                          · Transport: {entry.transportCondition}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(entry)}
                    className="shrink-0 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary-hover transition-colors"
                  >
                    Start QC
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <QCModal
          entry={selected}
          onClose={() => setSelected(null)}
          onSuccess={handleQCSuccess}
        />
      )}
    </div>
  );
}
