"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Warehouse as WarehouseIcon, Plus, RefreshCw, MapPin, Users,
  Phone, Mail, CheckCircle2, AlertCircle, Clock, Package, Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import { useWMSUser } from "@/shared/context/WMSUserContext";

interface WarehouseData {
  _id: string;
  warehouseCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  contactPerson: string;
  phone: string;
  email: string;
  totalZones: number;
  totalCapacityKg: number;
  status: "Active" | "Inactive" | "Planned";
  isActive: boolean;
  userCount?: number;
  createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  Active: "bg-status-success-surface text-status-success",
  Inactive: "bg-status-danger-surface text-status-danger",
  Planned: "bg-status-warning-surface text-status-warning",
};

const STATUS_ICON: Record<string, React.ElementType> = {
  Active: CheckCircle2,
  Inactive: AlertCircle,
  Planned: Clock,
};

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman & Nicobar","Chandigarh","Dadra & Nagar Haveli","Daman & Diu",
  "Delhi","Lakshadweep","Puducherry","Ladakh","Jammu & Kashmir",
];

function AddWarehouseModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: "", address: "", city: "", state: "Telangana", pinCode: "",
    contactPerson: "", phone: "", email: "",
    totalZones: "26", totalCapacityKg: "50000",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/wms/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Warehouse "${form.name}" created · Code: ${data.data.warehouseCode}`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.message ?? "Failed to create warehouse");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-heading/50 backdrop-blur-sm p-4">
      <div className="bg-surface-card rounded-2xl border border-border w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface-card">
          <h2 className="font-bold text-foreground-heading flex items-center gap-2">
            <WarehouseIcon className="h-4 w-4 text-primary" /> New Warehouse
          </h2>
          <button onClick={onClose} className="text-foreground-muted text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs text-foreground-muted">
            A unique 8-character alphanumeric warehouse code will be auto-generated and pre-attached to all SKUs created in this warehouse (e.g., <span className="font-mono font-bold text-primary">FR3SH-AB12CD34-A-0001</span>).
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Warehouse Name *</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="e.g. Hyderabad Hub – Gachibowli" />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Address</label>
            <input value={form.address} onChange={(e) => set("address", e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:border-primary"
              placeholder="Street / Area" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-foreground-muted mb-1">City *</label>
              <input required value={form.city} onChange={(e) => set("city", e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none"
                placeholder="Hyderabad" />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-foreground-muted mb-1">State *</label>
              <select value={form.state} onChange={(e) => set("state", e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none">
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">PIN Code</label>
              <input value={form.pinCode} onChange={(e) => set("pinCode", e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none"
                placeholder="500032" maxLength={6} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Contact Person *</label>
              <input required value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none"
                placeholder="Name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Phone *</label>
              <input required value={form.phone} onChange={(e) => set("phone", e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none"
                placeholder="+91 98765 43210" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-foreground-muted mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none"
                placeholder="warehouse@fr3sh.in" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Total Zones</label>
              <input type="number" value={form.totalZones} onChange={(e) => set("totalZones", e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Capacity (kg)</label>
              <input type="number" value={form.totalCapacityKg} onChange={(e) => set("totalCapacityKg", e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-border px-5 py-2 text-sm font-medium hover:bg-surface">Cancel</button>
            <button type="submit" disabled={submitting}
              className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover disabled:opacity-60">
              {submitting ? "Creating…" : "Create Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WarehousesPage() {
  const { user } = useWMSUser();
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const isSuperAdmin = user?.role === "Super Admin";

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wms/warehouses");
      const data = await res.json();
      if (data.success) setWarehouses(data.data);
    } catch { toast.error("Failed to load warehouses"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Warehouse code copied");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
            <WarehouseIcon className="h-6 w-6 text-primary" /> Warehouses
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Each warehouse has a unique code pre-attached to all its SKUs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchWarehouses}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-foreground-muted hover:bg-secondary-subtle">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {isSuperAdmin && (
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-hover">
              <Plus className="h-4 w-4" /> Add Warehouse
            </button>
          )}
        </div>
      </div>

      {/* SKU format explanation */}
      <div className="rounded-2xl bg-surface-card border border-border p-5">
        <h3 className="font-semibold text-foreground-heading mb-2 text-sm">SKU Format</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <code className="rounded-xl bg-primary/10 text-primary font-mono font-bold px-4 py-2 text-base tracking-widest">
            FR3SH-<span className="text-brand">AB12CD34</span>-<span className="text-foreground-heading">A</span>-<span className="text-foreground-muted">0001</span>
          </code>
          <div className="flex gap-4 text-xs flex-wrap">
            <span><span className="font-bold text-primary">FR3SH</span> — Brand prefix</span>
            <span><span className="font-bold text-brand">AB12CD34</span> — Warehouse code (8 chars)</span>
            <span><span className="font-bold text-foreground-heading">A</span> — Zone (A–Z)</span>
            <span><span className="font-bold text-foreground-muted">0001</span> — Sequence</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-foreground-muted gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" /> Loading warehouses…
        </div>
      ) : warehouses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-foreground-muted gap-3">
          <WarehouseIcon className="h-12 w-12 opacity-30" />
          <p className="text-base font-medium">No warehouses configured</p>
          {isSuperAdmin && (
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary-hover mt-2">
              <Plus className="h-4 w-4" /> Create first warehouse
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {warehouses.map((wh) => {
            const StatusIcon = STATUS_ICON[wh.status] ?? CheckCircle2;
            const isCurrentWarehouse = user?.warehouseId === wh.warehouseCode;

            return (
              <div key={wh._id}
                className={`rounded-2xl bg-surface-card border p-5 space-y-4 transition-shadow hover:shadow-md ${
                  isCurrentWarehouse ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
                      <WarehouseIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-foreground-heading">{wh.name}</h3>
                        {isCurrentWarehouse && (
                          <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs font-bold">
                            Your Warehouse
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <button
                          onClick={() => copyCode(wh.warehouseCode)}
                          className="flex items-center gap-1 font-mono text-xs text-primary hover:text-primary-hover transition-colors"
                          title="Click to copy"
                        >
                          {wh.warehouseCode}
                          <Copy className="h-3 w-3" />
                        </button>
                        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[wh.status]}`}>
                          <StatusIcon className="h-3 w-3" /> {wh.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 text-sm text-foreground-muted">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  <span>
                    {[wh.address, wh.city, wh.state, wh.pinCode].filter(Boolean).join(", ")}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-surface p-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground-heading">{wh.totalZones}</p>
                    <p className="text-xs text-foreground-muted">Zones</p>
                  </div>
                  <div className="text-center border-l border-border">
                    <p className="text-xl font-bold text-foreground-heading">
                      {wh.totalCapacityKg >= 1000
                        ? `${(wh.totalCapacityKg / 1000).toFixed(0)}T`
                        : `${wh.totalCapacityKg}kg`}
                    </p>
                    <p className="text-xs text-foreground-muted">Capacity</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-1.5 text-xs text-foreground-muted">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span>{wh.contactPerson}</span>
                    {wh.userCount !== undefined && (
                      <span className="ml-auto font-medium text-foreground-body">
                        {wh.userCount} user{wh.userCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{wh.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{wh.email}</span>
                  </div>
                </div>

                {/* SKU preview */}
                <div className="rounded-xl border border-border bg-surface p-2.5">
                  <p className="text-xs text-foreground-muted mb-1">Sample SKU from this warehouse</p>
                  <code className="font-mono text-xs font-bold text-primary">
                    FR3SH-{wh.warehouseCode}-A-0001
                  </code>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <AddWarehouseModal onClose={() => setShowAdd(false)} onSuccess={fetchWarehouses} />
      )}
    </div>
  );
}
