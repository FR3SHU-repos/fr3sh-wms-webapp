"use client";

import React, { useState } from "react";
import { PackageOpen, Plus, Search, Filter, Upload, Camera } from "lucide-react";
import toast from "react-hot-toast";

const UNITS = ["kg", "g", "litre", "ml", "packet", "box", "crate", "bundle", "dozen", "piece"];
const TRANSPORT_CONDITIONS = ["Good", "Slightly Damaged Packaging", "Temperature Deviation", "Delay – Same Day", "Delay – Next Day", "Other"];

const STATUS_BADGE: Record<string, string> = {
  "QC Pending": "bg-status-warning-surface text-status-warning",
  Accepted: "bg-status-success-surface text-status-success",
  Putaway: "bg-status-info-surface text-status-info",
  Rejected: "bg-status-danger-surface text-status-danger",
};

const SAMPLE_ENTRIES = [
  {
    id: "INW-2026-0041",
    farmer: "Ramaiah FPO",
    product: "Organic Turmeric",
    sku: "FR3SH-I-0201",
    qty: "200",
    unit: "kg",
    batch: "I-20260625-A1B2",
    harvestDate: "2026-06-20",
    receivedDate: "2026-06-25",
    shelfLife: 365,
    status: "QC Pending",
  },
  {
    id: "INW-2026-0040",
    farmer: "Srinivas Farm",
    product: "Foxtail Millet",
    sku: "FR3SH-B-0050",
    qty: "150",
    unit: "kg",
    batch: "B-20260625-C3D4",
    harvestDate: "2026-06-18",
    receivedDate: "2026-06-25",
    shelfLife: 730,
    status: "Accepted",
  },
  {
    id: "INW-2026-0039",
    farmer: "Green Valley FPO",
    product: "Organic Rice – Sona Masoori",
    sku: "FR3SH-A-0001",
    qty: "500",
    unit: "kg",
    batch: "A-20260625-E5F6",
    harvestDate: "2026-06-15",
    receivedDate: "2026-06-25",
    shelfLife: 365,
    status: "Putaway",
  },
];

function NewInwardModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    farmer: "",
    product: "",
    sku: "",
    qty: "",
    unit: "kg",
    harvestDate: "",
    expectedShelfLife: "",
    transportCondition: "Good",
    purchasePrice: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.promise(
      fetch("/api/wms/inward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).then((r) => r.json()),
      {
        loading: "Creating inward entry…",
        success: "Inward entry created — QC pending",
        error: "Failed to create entry",
      },
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-heading/40 backdrop-blur-sm p-4">
      <div className="bg-surface-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground-heading text-lg">New Inward Entry</h2>
          <button onClick={onClose} className="text-foreground-muted hover:text-foreground-heading text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Farmer / Supplier *</label>
              <input required value={form.farmer} onChange={(e) => setForm({ ...form, farmer: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder="e.g. Ramaiah FPO" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Product *</label>
              <input required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder="e.g. Organic Rice" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">SKU / Barcode</label>
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder="FR3SH-A-0001" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-foreground-muted mb-1">Quantity *</label>
                <input required type="number" min="0" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" />
              </div>
              <div className="w-28">
                <label className="block text-xs font-medium text-foreground-muted mb-1">Unit</label>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus">
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Harvest Date</label>
              <input type="date" value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Expected Shelf Life (days)</label>
              <input type="number" value={form.expectedShelfLife} onChange={(e) => setForm({ ...form, expectedShelfLife: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder="e.g. 365" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Transport Condition</label>
              <select value={form.transportCondition} onChange={(e) => setForm({ ...form, transportCondition: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus">
                {TRANSPORT_CONDITIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Purchase / Settlement Price (₹)</label>
              <input type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder="per kg/unit" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus resize-none" />
          </div>

          <div className="flex gap-3 border-t border-border pt-2">
            <button type="button" className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-secondary-subtle">
              <Upload className="h-4 w-4" /> Upload Invoice / Challan
            </button>
            <button type="button" className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-secondary-subtle">
              <Camera className="h-4 w-4" /> Add Photos
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-xl border border-border px-5 py-2 text-sm font-medium hover:bg-surface">Cancel</button>
            <button type="submit" className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover">
              Submit Inward
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InwardPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = SAMPLE_ENTRIES.filter(
    (e) =>
      e.product.toLowerCase().includes(search.toLowerCase()) ||
      e.farmer.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
            <PackageOpen className="h-6 w-6 text-primary" /> Inward / Stock Receiving
          </h1>
          <p className="text-sm text-foreground-muted mt-1">Receive and record incoming produce from farmers & FPOs</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> New Inward Entry
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 flex items-center gap-2 rounded-xl border border-border bg-surface-card px-3 py-2">
          <Search className="h-4 w-4 text-foreground-muted shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, farmer, entry ID…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-muted"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-foreground-muted hover:bg-secondary-subtle">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-foreground-muted">
                {["Entry ID", "Farmer / FPO", "Product", "SKU", "Qty", "Batch ID", "Harvest Date", "Received Date", "Shelf Life", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-surface transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{e.id}</td>
                  <td className="px-4 py-3 text-foreground-body">{e.farmer}</td>
                  <td className="px-4 py-3 font-medium text-foreground-heading">{e.product}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{e.sku}</td>
                  <td className="px-4 py-3">{e.qty} {e.unit}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{e.batch}</td>
                  <td className="px-4 py-3 text-foreground-body">{e.harvestDate}</td>
                  <td className="px-4 py-3 text-foreground-body">{e.receivedDate}</td>
                  <td className="px-4 py-3 text-foreground-body">{e.shelfLife}d</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[e.status] ?? "bg-tertiary text-tertiary-foreground"}`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-foreground-muted">No entries found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <NewInwardModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
