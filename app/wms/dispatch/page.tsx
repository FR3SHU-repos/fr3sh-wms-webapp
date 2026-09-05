"use client";

import React, { useEffect, useState } from "react";
import { Truck, QrCode, Printer, MapPin, Clock } from "lucide-react";
import toast from "react-hot-toast";

const DISPATCH_QUEUE = [
  { id: "DISP-2026-0088", orderId: "FR1017", customer: "Ravi Shankar", address: "45 Jubilee Hills, Hyderabad", items: 3, weight: "4.5 kg", courier: "Dunzo", awb: "", status: "Ready for Dispatch" },
  { id: "DISP-2026-0087", orderId: "FR1016", customer: "Ananya Rao", address: "12 Banjara Hills, Hyderabad", items: 2, weight: "2.2 kg", courier: "Porter", awb: "PTR-2026-0011", status: "Dispatched" },
  { id: "DISP-2026-0086", orderId: "FR1015", customer: "Kiran Patel", address: "88 Jubilee Hills, Hyderabad", items: 5, weight: "8 kg", courier: "BlueDart", awb: "BD-9988776", status: "In Transit" },
  { id: "DISP-2026-0085", orderId: "FR1014", customer: "Lakshmi Devi", address: "23 Secunderabad", items: 1, weight: "1 kg", courier: "Dunzo", awb: "DZ-20260624-001", status: "Delivered" },
];

const STATUS_BADGE: Record<string, string> = {
  "Ready for Dispatch": "bg-secondary text-secondary-foreground",
  Dispatched: "bg-status-info-surface text-status-info",
  "In Transit": "bg-status-warning-surface text-status-warning",
  Delivered: "bg-status-success-surface text-status-success",
};

const COURIERS = ["Dunzo", "Porter", "BlueDart", "Delhivery", "DTDC", "Shadowfax", "Local Rider"];

export default function DispatchPage() {
  const [awbInputs, setAwbInputs] = useState<Record<string, string>>({});
  const [queue, setQueue] = useState(DISPATCH_QUEUE.slice(0, 0));

  useEffect(() => { Promise.all([fetch("/api/wms/packing?status=packed").then(r => r.json()), fetch("/api/wms/dispatch").then(r => r.json())]).then(([p, d]) => {
    const ready = (p.data ?? []).map((x: any) => ({ id: x.packId, orderId: x.pickId, customer: "", address: "", items: (x.items ?? []).length, weight: `${(x.weightGrams ?? 0) / 1000} kg`, courier: "Local Rider", awb: "", status: "Ready for Dispatch" }));
    const sent = (d.data ?? []).map((x: any) => ({ id: x.dispatchId, packId: x.packId, orderId: x.packId, customer: "", address: "", items: (x.items ?? []).length, weight: "", courier: x.courier, awb: x.tracking, status: "Dispatched" })); setQueue([...ready, ...sent]);
  }).catch(() => toast.error("Dispatch service unavailable")); }, []);
  const dispatch = async (id: string) => {
    if (!awbInputs[id]) { toast.error("Enter AWB / tracking number"); return; }
    const row = queue.find(x => x.id === id); const res = await fetch("/api/wms/dispatch", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ packId: id, courier: row?.courier, tracking: awbInputs[id] }) });
    if (!res.ok) { toast.error((await res.json()).message ?? "Dispatch failed"); return; } setQueue(q => q.map(x => x.id === id ? { ...x, status: "Dispatched", awb: awbInputs[id] } : x)); toast.success("Dispatched — tracking active");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" /> Dispatch / Shipping
        </h1>
        <p className="text-sm text-foreground-muted mt-1">Manage courier assignment, manifests and dispatch scanning</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Ready for Dispatch", value: queue.filter(d => d.status === "Ready for Dispatch").length },
          { label: "Dispatched Today", value: queue.filter(d => d.status === "Dispatched").length },
          { label: "In Transit", value: queue.filter(d => d.status === "In Transit").length },
          { label: "Delivered Today", value: queue.filter(d => d.status === "Delivered").length },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface-card border border-border p-4">
            <p className="text-xs text-foreground-muted font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-foreground-heading mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary-hover">
          <Printer className="h-4 w-4" /> Generate Manifest
        </button>
      </div>

      <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-foreground-muted">
                {["Dispatch ID", "Order", "Customer", "Items / Weight", "Courier", "AWB / Tracking", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {queue.map((d) => (
                <tr key={d.id} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{d.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground-heading">{d.orderId}</td>
                  <td className="px-4 py-3">
                    <p className="text-foreground-body">{d.customer}</p>
                    <p className="text-xs text-foreground-muted flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {d.address}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-foreground-body">{d.items} items · {d.weight}</td>
                  <td className="px-4 py-3">
                    {d.status === "Ready for Dispatch" ? (
                      <select className="rounded-lg border border-border bg-surface px-2 py-1 text-xs focus:outline-none">
                        {COURIERS.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    ) : (
                      <span className="text-foreground-body">{d.courier}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {d.status === "Ready for Dispatch" ? (
                      <input
                        value={awbInputs[d.id] ?? ""}
                        onChange={(e) => setAwbInputs({ ...awbInputs, [d.id]: e.target.value })}
                        placeholder="Enter AWB…"
                        className="rounded-lg border border-border bg-surface px-2 py-1 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-border-focus"
                      />
                    ) : (
                      <span className="font-mono text-xs text-foreground-muted">{d.awb || "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[d.status] ?? ""}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {d.status === "Ready for Dispatch" && (
                      <button
                        onClick={() => dispatch(d.id)}
                        className="flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary-hover"
                      >
                        <Truck className="h-3 w-3" /> Dispatch
                      </button>
                    )}
                    {d.status === "Dispatched" && (
                      <button className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary-subtle">
                        <Clock className="h-3 w-3" /> Track
                      </button>
                    )}
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
