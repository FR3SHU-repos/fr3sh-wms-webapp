"use client";

import React, { useState } from "react";
import { MapPin, Plus, QrCode, ChevronRight, Thermometer } from "lucide-react";

const ZONES = [
  { code: "A", name: "Rice & Grains", type: "Ambient", aisles: 3, bins: 120, used: 72, temp: "18–25°C" },
  { code: "B", name: "Millets", type: "Ambient", aisles: 2, bins: 80, used: 45, temp: "18–25°C" },
  { code: "C", name: "Fresh Fruits", type: "Cold", aisles: 2, bins: 60, used: 30, temp: "2–8°C" },
  { code: "D", name: "Vegetables", type: "Cold", aisles: 3, bins: 90, used: 88, temp: "2–8°C" },
  { code: "E", name: "Leafy Greens", type: "Cold", aisles: 1, bins: 40, used: 95, temp: "0–4°C" },
  { code: "G", name: "Pulses & Lentils", type: "Ambient", aisles: 2, bins: 80, used: 61, temp: "18–25°C" },
  { code: "I", name: "Spices", type: "Ambient", aisles: 2, bins: 70, used: 38, temp: "18–25°C" },
  { code: "L", name: "Cold-Pressed Oils", type: "Cool", aisles: 1, bins: 50, used: 55, temp: "10–18°C" },
  { code: "Q", name: "Dairy", type: "Refrigerated", aisles: 1, bins: 30, used: 40, temp: "1–4°C" },
];

const TYPE_BADGE: Record<string, string> = {
  Ambient: "bg-status-info-surface text-status-info",
  Cold: "bg-status-info-surface text-blue-700",
  Cool: "bg-secondary text-secondary-foreground",
  Refrigerated: "bg-status-info-surface text-blue-900",
};

function NewZoneModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-heading/40 backdrop-blur-sm p-4">
      <div className="bg-surface-card rounded-2xl border border-border w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground-heading">Create New Zone / Location</h2>
          <button onClick={onClose} className="text-foreground-muted text-xl">×</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {[
            { label: "Level", options: ["Zone", "Aisle", "Rack", "Shelf", "Bin"] },
            { label: "Parent Location (for sub-levels)" },
            { label: "Code / Name" },
            { label: "Storage Type", options: ["Ambient", "Cold", "Cool", "Refrigerated", "Frozen"] },
            { label: "Capacity (units / kg)" },
            { label: "Temperature Range" },
            { label: "Product Category Mapping" },
          ].map((f, i) => (
            <div key={i}>
              <label className="block text-xs font-medium text-foreground-muted mb-1">{f.label}</label>
              {f.options ? (
                <select className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus">
                  {f.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button onClick={onClose} className="rounded-xl border border-border px-5 py-2 text-sm font-medium hover:bg-surface">Cancel</button>
            <button className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover">Create</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LocationsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" /> Warehouse Locations
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Hierarchy: Warehouse → Zone → Aisle → Rack → Shelf → Bin
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Add Location
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ZONES.map((zone) => (
          <div key={zone.code} className="rounded-2xl bg-surface-card border border-border p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
                  {zone.code}
                </div>
                <div>
                  <p className="font-semibold text-foreground-heading">{zone.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[zone.type]}`}>
                      {zone.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-foreground-muted">
                      <Thermometer className="h-3 w-3" /> {zone.temp}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground-muted mt-1" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-foreground-muted">
                <span>{zone.aisles} aisles · {zone.bins} bins</span>
                <span className={`font-bold ${zone.used >= 90 ? "text-status-danger" : zone.used >= 70 ? "text-status-warning" : "text-status-success"}`}>
                  {zone.used}% used
                </span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${zone.used >= 90 ? "bg-status-danger" : zone.used >= 70 ? "bg-status-warning" : "bg-primary"}`}
                  style={{ width: `${zone.used}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-secondary-subtle">
                <QrCode className="h-3 w-3" /> Print Labels
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-secondary-subtle">
                View Bins
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-surface-card border border-border p-6">
        <h2 className="font-semibold text-foreground-heading mb-4">Bin Detail Example</h2>
        <div className="font-mono text-sm bg-surface rounded-xl p-4 text-foreground-body space-y-1">
          <p>Warehouse: FR3SH Godown 1</p>
          <p>  └── Zone A (Rice & Grains)</p>
          <p>        └── Aisle 01 (Rice)</p>
          <p>              └── Rack 03 (Organic Sona Masoori)</p>
          <p>                    └── Bin 04 → Batch A-20260625-E5F6 · 420 kg available</p>
        </div>
      </div>

      {showModal && <NewZoneModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
