"use client";

import React, { useState } from "react";
import { Boxes, Search, Filter, Download, TrendingDown } from "lucide-react";

const CATEGORIES = ["All", "Rice & Grains", "Millets", "Pulses & Lentils", "Spices", "Vegetables", "Fresh Fruits", "Cold-Pressed Oils", "Flours & Powders"];

const SAMPLE_INVENTORY = [
  { sku: "FR3SH-A-0001", product: "Organic Rice – Sona Masoori", category: "Rice & Grains", farmer: "Green Valley FPO", batch: "A-20260625-E5F6", location: "Zone A / R3 / B4", total: 500, reserved: 80, damaged: 0, expired: 0, returned: 0, inTransit: 0, unit: "kg", expiryDate: "2027-06-25" },
  { sku: "FR3SH-B-0050", product: "Foxtail Millet", category: "Millets", farmer: "Srinivas Farm", batch: "B-20260625-C3D4", location: "Zone B / R2 / B1", total: 150, reserved: 20, damaged: 5, expired: 0, returned: 0, inTransit: 0, unit: "kg", expiryDate: "2028-06-25" },
  { sku: "FR3SH-G-0120", product: "Organic Toor Dal", category: "Pulses & Lentils", farmer: "Satya FPO", batch: "G-20260610-F7G8", location: "Zone G / R1 / B2", total: 300, reserved: 60, damaged: 0, expired: 0, returned: 5, inTransit: 0, unit: "kg", expiryDate: "2027-12-10" },
  { sku: "FR3SH-I-0201", product: "Organic Turmeric", category: "Spices", farmer: "Ramaiah FPO", batch: "I-20260625-A1B2", location: "Zone I / R5 / B2", total: 200, reserved: 0, damaged: 0, expired: 0, returned: 0, inTransit: 200, unit: "kg", expiryDate: "2027-06-20" },
  { sku: "FR3SH-L-0301", product: "Cold-Pressed Coconut Oil", category: "Cold-Pressed Oils", farmer: "Kavitha Organics", batch: "L-20260625-C3D4", location: "Zone L / R2 / B3", total: 60, reserved: 10, damaged: 2, expired: 0, returned: 0, inTransit: 0, unit: "litre", expiryDate: "2026-12-25" },
  { sku: "FR3SH-D-0080", product: "Organic Tomato", category: "Vegetables", farmer: "Vidya Farm", batch: "D-20260620-H9I0", location: "Zone D / R4 / B1", total: 120, reserved: 30, damaged: 10, expired: 0, returned: 3, inTransit: 0, unit: "kg", expiryDate: "2026-07-05" },
];

function available(row: typeof SAMPLE_INVENTORY[0]) {
  return row.total - row.reserved - row.damaged - row.expired;
}

function expiryStatus(expiryDate: string) {
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  if (days <= 0) return { label: "Expired", cls: "bg-status-danger-surface text-status-danger" };
  if (days <= 7) return { label: `${days}d left`, cls: "bg-status-danger-surface text-status-danger" };
  if (days <= 30) return { label: `${days}d left`, cls: "bg-status-warning-surface text-status-warning" };
  return { label: `${days}d left`, cls: "bg-status-success-surface text-status-success" };
}

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = SAMPLE_INVENTORY.filter((item) => {
    const matchCat = category === "All" || item.category === category;
    const matchSearch =
      item.product.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.farmer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalValue = filtered.reduce((acc, item) => acc + available(item), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" /> Inventory
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Available = Total − Reserved − Damaged − Expired
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-border bg-surface-card px-4 py-2 text-sm font-medium hover:bg-secondary-subtle">
          <Download className="h-4 w-4" /> Export
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total SKUs", value: SAMPLE_INVENTORY.length },
          { label: "Total Available", value: `${SAMPLE_INVENTORY.reduce((a, i) => a + available(i), 0)} units` },
          { label: "Low Stock SKUs", value: SAMPLE_INVENTORY.filter(i => available(i) < 20).length },
          { label: "Near Expiry", value: SAMPLE_INVENTORY.filter(i => { const d = Math.ceil((new Date(i.expiryDate).getTime() - Date.now()) / 86400000); return d > 0 && d <= 30; }).length },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface-card border border-border p-4">
            <p className="text-xs text-foreground-muted font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-foreground-heading mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 flex items-center gap-2 rounded-xl border border-border bg-surface-card px-3 py-2">
          <Search className="h-4 w-4 text-foreground-muted shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, SKU, farmer…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-muted" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-border bg-surface-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="flex items-center gap-2 rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-foreground-muted hover:bg-secondary-subtle">
          <Filter className="h-4 w-4" /> More Filters
        </button>
      </div>

      <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-foreground-muted">
                {["SKU", "Product", "Category", "Farmer", "Batch", "Location", "Total", "Reserved", "Damaged", "Available", "Status", "Expiry"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => {
                const avail = available(item);
                const exp = expiryStatus(item.expiryDate);
                const isLow = avail < 20;
                return (
                  <tr key={item.sku + item.batch} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{item.sku}</td>
                    <td className="px-4 py-3 font-medium text-foreground-heading whitespace-nowrap">{item.product}</td>
                    <td className="px-4 py-3 text-foreground-body">{item.category}</td>
                    <td className="px-4 py-3 text-foreground-body">{item.farmer}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{item.batch}</td>
                    <td className="px-4 py-3 text-foreground-body whitespace-nowrap">{item.location}</td>
                    <td className="px-4 py-3">{item.total} {item.unit}</td>
                    <td className="px-4 py-3 text-status-info">{item.reserved} {item.unit}</td>
                    <td className="px-4 py-3 text-status-danger">{item.damaged} {item.unit}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${isLow ? "text-status-danger" : "text-status-success"}`}>
                        {avail} {item.unit}
                      </span>
                      {isLow && <TrendingDown className="inline h-3 w-3 ml-1 text-status-danger" />}
                    </td>
                    <td className="px-4 py-3">
                      {isLow ? (
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-status-danger-surface text-status-danger">Low Stock</span>
                      ) : (
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-status-success-surface text-status-success">OK</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${exp.cls}`}>{exp.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
