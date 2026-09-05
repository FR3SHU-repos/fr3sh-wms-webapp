"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, Play, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const PICK_TASKS = [
  {
    id: "PICK-2026-0123",
    orderId: "FR1023",
    priority: "High",
    customerName: "Meera Reddy",
    items: [
      { product: "Organic Rice", sku: "FR3SH-A-0001", qty: 2, unit: "kg", location: "Zone A / R3 / B4", batch: "A-20260625-E5F6" },
      { product: "Toor Dal", sku: "FR3SH-G-0120", qty: 1, unit: "kg", location: "Zone G / R1 / B2", batch: "G-20260610-F7G8" },
      { product: "Turmeric", sku: "FR3SH-I-0201", qty: 0.5, unit: "kg", location: "Zone I / R5 / B2", batch: "I-20260625-A1B2" },
    ],
    status: "Pending Pick",
  },
  {
    id: "PICK-2026-0122",
    orderId: "FR1021",
    priority: "Normal",
    customerName: "Arun Kumar",
    items: [
      { product: "Foxtail Millet", sku: "FR3SH-B-0050", qty: 1, unit: "kg", location: "Zone B / R2 / B1", batch: "B-20260625-C3D4" },
      { product: "Cold-Pressed Coconut Oil", sku: "FR3SH-L-0301", qty: 1, unit: "litre", location: "Zone L / R2 / B3", batch: "L-20260625-C3D4" },
    ],
    status: "Picking",
  },
  {
    id: "PICK-2026-0121",
    orderId: "FR1019",
    priority: "Normal",
    customerName: "Sunita Sharma",
    items: [
      { product: "Organic Tomato", sku: "FR3SH-D-0080", qty: 2, unit: "kg", location: "Zone D / R4 / B1", batch: "D-20260620-H9I0" },
    ],
    status: "Picked",
  },
];

const STATUS_COLORS: Record<string, string> = {
  "Pending Pick": "bg-status-warning-surface text-status-warning",
  Picking: "bg-status-info-surface text-status-info",
  Picked: "bg-status-success-surface text-status-success",
  "Sent to Packing": "bg-tertiary text-tertiary-foreground",
};

export default function PickingPage() {
  const [tasks, setTasks] = useState(PICK_TASKS.slice(0, 0));
  const [active, setActive] = useState<typeof PICK_TASKS[0] | null>(null);

  useEffect(() => { fetch("/api/wms/picking", { cache: "no-store" }).then(r => r.json()).then(x => {
    if (x.success) setTasks(x.data.map((t: any) => ({ ...t, id: t.pickId, orderId: t.orderId, status: t.status === "allocated" ? "Pending Pick" : t.status === "in_progress" ? "Picking" : t.status === "picked" ? "Picked" : "Cancelled", items: (t.items ?? []).map((i: any) => ({ product: i.product ?? i.skuCode, sku: i.skuCode, qty: i.quantity, unit: i.unit, location: i.locationId, batch: i.lotId })) })));
  }).catch(() => toast.error("Picking service unavailable")); }, []);

  const updatePick = async (taskId: string, status: string) => {
    const current: any = tasks.find(t => t.id === taskId);
    const res = await fetch(`/api/wms/picking?id=${encodeURIComponent(taskId)}`, { method: "PATCH", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ status, revision: current?.revision ?? 1 }) });
    if (!res.ok) throw new Error((await res.json()).message ?? "Pick update failed");
  };
  const startPick = async (taskId: string) => {
    try { await updatePick(taskId, "in_progress"); setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: "Picking", revision: ((t as any).revision ?? 1) + 1 } as any : t)); toast.success("Pick task started"); } catch (e) { toast.error(e instanceof Error ? e.message : "Pick update failed"); }
  };

  const completePick = async (taskId: string) => {
    try { await updatePick(taskId, "picked"); const pack = await fetch("/api/wms/packing", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ pickId: taskId, packageId: `PKG-${crypto.randomUUID()}` }) }); if (!pack.ok) throw new Error((await pack.json()).message ?? "Packing task creation failed"); setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: "Picked" } : t)); setActive(null); toast.success("Items picked — packing task created"); } catch (e) { toast.error(e instanceof Error ? e.message : "Pick update failed"); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" /> Order Picking
        </h1>
        <p className="text-sm text-foreground-muted mt-1">Pick items from warehouse bins to fulfil customer orders</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Pick", value: tasks.filter(t => t.status === "Pending Pick").length, icon: Clock, color: "text-status-warning", bg: "bg-status-warning-surface" },
          { label: "In Progress", value: tasks.filter(t => t.status === "Picking").length, icon: Play, color: "text-status-info", bg: "bg-status-info-surface" },
          { label: "Picked Today", value: tasks.filter(t => t.status === "Picked").length, icon: CheckCircle2, color: "text-status-success", bg: "bg-status-success-surface" },
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

      <div className="grid grid-cols-1 gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-2xl bg-surface-card border border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-foreground-heading">Order #{task.orderId}</span>
                <span className="font-mono text-xs text-foreground-muted">{task.id}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${task.priority === "High" ? "bg-status-danger-surface text-status-danger" : "bg-surface text-foreground-muted"}`}>
                  {task.priority}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[task.status]}`}>
                  {task.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground-muted">{task.customerName}</span>
                {task.status === "Pending Pick" && (
                  <button
                    onClick={() => startPick(task.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary-hover"
                  >
                    <Play className="h-3.5 w-3.5" /> Start Pick
                  </button>
                )}
                {task.status === "Picking" && (
                  <button
                    onClick={() => setActive(task)}
                    className="flex items-center gap-1.5 rounded-xl bg-status-success text-white px-3 py-1.5 text-sm font-medium"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-border">
              {task.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 px-6 py-3">
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${task.status === "Picked" ? "bg-status-success text-white" : "bg-secondary text-secondary-foreground"}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground-heading">{item.product}</p>
                    <p className="text-xs text-foreground-muted font-mono">{item.sku} · Batch: {item.batch}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground-heading">{item.qty} {item.unit}</p>
                    <p className="text-xs text-foreground-muted">{item.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-heading/40 backdrop-blur-sm p-4">
          <div className="bg-surface-card rounded-2xl border border-border w-full max-w-md shadow-xl">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-bold text-foreground-heading">Confirm Pick — Order #{active.orderId}</h2>
              <p className="text-xs text-foreground-muted">Scan or confirm all items before completing</p>
            </div>
            <div className="px-6 py-4 space-y-3">
              {active.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <CheckCircle2 className="h-5 w-5 text-status-success shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground-heading">{item.product}</p>
                    <p className="text-xs text-foreground-muted">{item.qty} {item.unit} · {item.location}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setActive(null)} className="rounded-xl border border-border px-5 py-2 text-sm font-medium hover:bg-surface">Cancel</button>
              <button onClick={() => completePick(active.id)} className="rounded-xl bg-status-success text-white px-5 py-2 text-sm font-medium">
                Mark as Picked
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
