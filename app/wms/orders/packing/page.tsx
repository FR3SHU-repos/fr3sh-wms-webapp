"use client";

import React, { useState } from "react";
import { Package, CheckCircle2, Printer, Scale, QrCode } from "lucide-react";
import toast from "react-hot-toast";

const PACKING_QUEUE = [
  {
    id: "PACK-2026-0121",
    orderId: "FR1019",
    customer: "Sunita Sharma",
    address: "Flat 4B, Green Hills, Hyderabad",
    items: [
      { product: "Organic Tomato", sku: "FR3SH-D-0080", qty: 2, unit: "kg", batch: "D-20260620-H9I0", verified: false },
    ],
    expectedWeight: "2.1 kg",
    status: "Pending Packing",
  },
  {
    id: "PACK-2026-0120",
    orderId: "FR1018",
    customer: "Priya Nair",
    address: "12 MG Road, Bangalore",
    items: [
      { product: "Organic Rice – Sona Masoori", sku: "FR3SH-A-0001", qty: 5, unit: "kg", batch: "A-20260625-E5F6", verified: false },
      { product: "Foxtail Millet", sku: "FR3SH-B-0050", qty: 1, unit: "kg", batch: "B-20260625-C3D4", verified: false },
    ],
    expectedWeight: "6.3 kg",
    status: "Packing",
  },
];

export default function PackingPage() {
  const [orders, setOrders] = useState(PACKING_QUEUE);
  const [active, setActive] = useState<(typeof PACKING_QUEUE)[0] | null>(null);

  const toggleVerify = (orderId: string, idx: number) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, items: o.items.map((item, i) => i === idx ? { ...item, verified: !item.verified } : item) }
          : o,
      ),
    );
  };

  const completePack = (orderId: string) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: "Packed" } : o));
    setActive(null);
    toast.success("Order packed — ready for dispatch");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" /> Packing Station
        </h1>
        <p className="text-sm text-foreground-muted mt-1">Verify picked items, check weight, and prepare for dispatch</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Packing", value: orders.filter(o => o.status === "Pending Packing" || o.status === "Packing").length },
          { label: "Packed Today", value: 8 },
          { label: "Dispatched Today", value: 22 },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface-card border border-border p-5">
            <p className="text-xs text-foreground-muted font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-foreground-heading mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-2xl bg-surface-card border border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground-heading">Order #{order.orderId}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === "Packed" ? "bg-status-success-surface text-status-success" : "bg-status-warning-surface text-status-warning"}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-foreground-muted">{order.customer} · {order.address}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Scale className="h-4 w-4" /> Expected: {order.expectedWeight}
              </div>
              {order.status !== "Packed" && (
                <button
                  onClick={() => setActive(order)}
                  className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary-hover"
                >
                  Pack this Order
                </button>
              )}
            </div>

            <div className="divide-y divide-border">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 px-6 py-3">
                  <div className={`h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center ${item.verified ? "border-status-success bg-status-success" : "border-tertiary"}`}>
                    {item.verified && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground-heading">{item.product}</p>
                    <p className="text-xs text-foreground-muted font-mono">{item.sku} · {item.batch}</p>
                  </div>
                  <span className="font-bold text-foreground-heading">{item.qty} {item.unit}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 px-6 py-3 border-t border-border bg-surface">
              <button className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-card px-3 py-1.5 text-xs font-medium hover:bg-secondary-subtle">
                <Printer className="h-3.5 w-3.5" /> Print Invoice
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-card px-3 py-1.5 text-xs font-medium hover:bg-secondary-subtle">
                <QrCode className="h-3.5 w-3.5" /> Shipping Label
              </button>
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-heading/40 backdrop-blur-sm p-4">
          <div className="bg-surface-card rounded-2xl border border-border w-full max-w-lg shadow-xl">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-bold text-foreground-heading">Pack Order #{active.orderId}</h2>
              <p className="text-xs text-foreground-muted">Scan and verify each item then confirm pack</p>
            </div>
            <div className="px-6 py-4 space-y-3">
              {active.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleVerify(active.id, idx)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${item.verified ? "border-status-success bg-status-success-surface" : "border-border hover:bg-secondary-subtle"}`}
                >
                  <div className={`h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center ${item.verified ? "border-status-success bg-status-success" : "border-tertiary"}`}>
                    {item.verified && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground-heading">{item.product}</p>
                    <p className="text-xs text-foreground-muted font-mono">{item.sku} · Batch: {item.batch}</p>
                  </div>
                  <span className="font-bold text-foreground-heading">{item.qty} {item.unit}</span>
                </button>
              ))}
              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-1">Actual Weight</label>
                <input className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder="Enter packed weight (kg)" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setActive(null)} className="rounded-xl border border-border px-5 py-2 text-sm font-medium">Cancel</button>
              <button
                disabled={!active.items.every(i => i.verified)}
                onClick={() => completePack(active.id)}
                className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Pack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
