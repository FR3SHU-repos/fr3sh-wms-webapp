"use client";

import React, { useState } from "react";
import { Layers, Clock, AlertTriangle, CheckCircle2, Search, Filter } from "lucide-react";

const SAMPLE_BATCHES = [
  { id: "A-20260625-E5F6", product: "Organic Rice – Sona Masoori", sku: "FR3SH-A-0001", farmer: "Green Valley FPO", farmLocation: "Nalgonda, Telangana", harvestDate: "2026-06-15", packingDate: "2026-06-20", expiryDate: "2027-06-20", organicCert: "NPOP-2025-001", qcResult: "Accepted", location: "Zone A / R3 / B4", qty: 420, unit: "kg", status: "Active" },
  { id: "I-20260625-A1B2", product: "Organic Turmeric", sku: "FR3SH-I-0201", farmer: "Ramaiah FPO", farmLocation: "Nizamabad, Telangana", harvestDate: "2026-06-20", packingDate: "2026-06-24", expiryDate: "2027-06-20", organicCert: "India Organic-2024-112", qcResult: "QC Pending", location: "In Transit", qty: 200, unit: "kg", status: "In Transit" },
  { id: "D-20260620-H9I0", product: "Organic Tomato", sku: "FR3SH-D-0080", farmer: "Vidya Farm", farmLocation: "Nashik, Maharashtra", harvestDate: "2026-06-19", packingDate: "2026-06-20", expiryDate: "2026-07-05", organicCert: "NPOP-2023-045", qcResult: "Accepted", location: "Zone D / R4 / B1", qty: 77, unit: "kg", status: "Near Expiry" },
  { id: "L-20260625-C3D4", product: "Cold-Pressed Coconut Oil", sku: "FR3SH-L-0301", farmer: "Kavitha Organics", farmLocation: "Coimbatore, Tamil Nadu", harvestDate: "2026-06-10", packingDate: "2026-06-23", expiryDate: "2026-12-25", organicCert: "USDA Organic-2025-009", qcResult: "QC Pending", location: "Zone L / R2 / B3", qty: 58, unit: "litre", status: "Active" },
  { id: "B-20260625-C3D4", product: "Foxtail Millet", sku: "FR3SH-B-0050", farmer: "Srinivas Farm", farmLocation: "Anantapur, AP", harvestDate: "2026-06-18", packingDate: "2026-06-22", expiryDate: "2028-06-18", organicCert: "NPOP-2024-078", qcResult: "Accepted", location: "Zone B / R2 / B1", qty: 125, unit: "kg", status: "Active" },
];

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-status-success-surface text-status-success",
  "Near Expiry": "bg-status-danger-surface text-status-danger",
  "In Transit": "bg-status-warning-surface text-status-warning",
  Expired: "bg-status-danger-surface text-status-danger",
  Consumed: "bg-tertiary text-tertiary-foreground",
};

const QC_COLORS: Record<string, string> = {
  Accepted: "bg-status-success-surface text-status-success",
  "QC Pending": "bg-status-warning-surface text-status-warning",
  Rejected: "bg-status-danger-surface text-status-danger",
  "Partially Accepted": "bg-status-info-surface text-status-info",
};

export default function BatchesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = SAMPLE_BATCHES.filter((b) => {
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    const matchSearch = b.product.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.farmer.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" /> Batches & Expiry Tracking
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          FEFO (First Expiry, First Out) — stock expiring earliest is picked first
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Batches", value: SAMPLE_BATCHES.filter(b => b.status === "Active").length, icon: CheckCircle2, color: "text-status-success", bg: "bg-status-success-surface" },
          { label: "Near Expiry (≤30d)", value: SAMPLE_BATCHES.filter(b => b.status === "Near Expiry").length, icon: AlertTriangle, color: "text-status-danger", bg: "bg-status-danger-surface" },
          { label: "In Transit / QC", value: SAMPLE_BATCHES.filter(b => b.status === "In Transit" || b.qcResult === "QC Pending").length, icon: Clock, color: "text-status-warning", bg: "bg-status-warning-surface" },
          { label: "Total Batches", value: SAMPLE_BATCHES.length, icon: Layers, color: "text-primary", bg: "bg-surface" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface-card border border-border p-4 flex items-center gap-3">
            <div className={`rounded-xl p-2 ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-foreground-muted font-medium">{s.label}</p>
              <p className="text-xl font-bold text-foreground-heading">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 flex items-center gap-2 rounded-xl border border-border bg-surface-card px-3 py-2">
          <Search className="h-4 w-4 text-foreground-muted shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batch ID, product, farmer…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-muted" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border bg-surface-card px-3 py-2 text-sm focus:outline-none">
          {["All", "Active", "Near Expiry", "In Transit", "Expired", "Consumed"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-foreground-muted">
                {["Batch ID", "Product", "Farmer", "Farm Location", "Harvest", "Expiry", "Organic Cert", "QC Result", "Location", "Qty", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-surface transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{b.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground-heading whitespace-nowrap">{b.product}</td>
                  <td className="px-4 py-3 text-foreground-body">{b.farmer}</td>
                  <td className="px-4 py-3 text-foreground-body">{b.farmLocation}</td>
                  <td className="px-4 py-3 text-foreground-body">{b.harvestDate}</td>
                  <td className="px-4 py-3 font-medium text-foreground-heading">{b.expiryDate}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{b.organicCert}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${QC_COLORS[b.qcResult] ?? ""}`}>{b.qcResult}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground-body whitespace-nowrap">{b.location}</td>
                  <td className="px-4 py-3">{b.qty} {b.unit}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[b.status] ?? ""}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
