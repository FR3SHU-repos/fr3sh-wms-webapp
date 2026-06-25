"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin, Plus, QrCode, ChevronRight, Thermometer, Package,
  RefreshCw, Home, Printer, X, Layers, ArrowLeft, Box, AlertTriangle,
} from "lucide-react";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Location {
  _id: string;
  code: string;
  name: string;
  type: string;
  zoneCode?: string;
  parentId?: string;
  storageType: string;
  temperatureRange?: string;
  capacityKg?: number;
  currentOccupancy: number;
  productCategoryMapping?: string[];
  isActive: boolean;
  batchCount?: number;
  totalQtyAvailable?: number;
}

interface Batch {
  _id: string;
  batchId: string;
  productName: string;
  skuCode: string;
  farmerName: string;
  quantityAvailable: number;
  quantityTotal: number;
  unit: string;
  status: string;
  expiryDate?: string;
  harvestDate?: string;
  currentLocationLabel?: string;
  zoneCode?: string;
}

type BreadcrumbItem = { id: string; code: string; name: string; type: string; zoneCode?: string };

// ── Styling helpers ────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<string, string> = {
  Ambient: "bg-amber-100 text-amber-700",
  Cold: "bg-blue-100 text-blue-700",
  Cool: "bg-cyan-100 text-cyan-700",
  Refrigerated: "bg-indigo-100 text-indigo-700",
  Frozen: "bg-purple-100 text-purple-700",
};

const BATCH_STATUS_BADGE: Record<string, string> = {
  Active: "bg-status-success-surface text-status-success",
  "Near Expiry": "bg-status-warning-surface text-status-warning",
  Expired: "bg-status-danger-surface text-status-danger",
};

const TYPE_ICON_LABEL: Record<string, string> = {
  zone: "Zone",
  aisle: "Aisle",
  rack: "Rack",
  shelf: "Shelf",
  bin: "Bin",
};

// ── Print Label Modal ──────────────────────────────────────────────────────────

function PrintLabelModal({
  location,
  onClose,
}: {
  location: Location;
  onClose: () => void;
}) {
  const qrData = JSON.stringify({
    warehouseId: "main",
    locationType: location.type,
    code: location.code,
    name: location.name,
    zone: location.zoneCode ?? location.code,
    storage: location.storageType,
    temp: location.temperatureRange ?? "",
    categories: (location.productCategoryMapping ?? []).join(", "),
    generated: new Date().toISOString(),
  });

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-heading/50 backdrop-blur-sm p-4">
      <div className="bg-surface-card rounded-2xl border border-border w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border print:hidden">
          <h2 className="font-bold text-foreground-heading flex items-center gap-2">
            <QrCode className="h-4 w-4 text-primary" /> Print Location Label
          </h2>
          <button onClick={onClose} className="text-foreground-muted hover:text-foreground-heading text-xl">×</button>
        </div>

        {/* ── Printable Label ── */}
        <div
          id="print-label"
          className="px-6 py-5 space-y-4"
          style={{ fontFamily: "monospace" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-foreground-heading pb-3">
            <div>
              <p className="text-xs font-bold text-foreground-muted uppercase tracking-widest">FR3SH Warehouse</p>
              <p className="text-xs text-foreground-muted">Location Label</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-foreground-muted">{new Date().toLocaleDateString("en-IN")}</p>
              <p className="text-xs text-foreground-muted uppercase">{location.type}</p>
            </div>
          </div>

          {/* Zone code large */}
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-primary-foreground font-bold text-4xl shrink-0">
              {location.code.split("-")[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold text-foreground-heading leading-tight">{location.name}</p>
              <p className="text-sm font-mono text-foreground-muted mt-0.5">{location.code}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${TYPE_BADGE[location.storageType] ?? "bg-tertiary text-tertiary-foreground"}`}>
                  {location.storageType}
                </span>
                {location.temperatureRange && (
                  <span className="flex items-center gap-1 text-xs text-foreground-muted">
                    <Thermometer className="h-3 w-3" /> {location.temperatureRange}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-xs rounded-xl bg-surface border border-border p-3">
            <div>
              <p className="text-foreground-muted font-medium uppercase tracking-wide">Location Code</p>
              <p className="font-mono font-bold text-foreground-heading text-sm mt-0.5">{location.code}</p>
            </div>
            <div>
              <p className="text-foreground-muted font-medium uppercase tracking-wide">Storage Type</p>
              <p className="font-bold text-foreground-heading mt-0.5">{location.storageType}</p>
            </div>
            {location.temperatureRange && (
              <div>
                <p className="text-foreground-muted font-medium uppercase tracking-wide">Temperature</p>
                <p className="font-bold text-foreground-heading mt-0.5">{location.temperatureRange}</p>
              </div>
            )}
            {location.capacityKg && (
              <div>
                <p className="text-foreground-muted font-medium uppercase tracking-wide">Capacity</p>
                <p className="font-bold text-foreground-heading mt-0.5">{location.capacityKg} kg</p>
              </div>
            )}
            {(location.productCategoryMapping?.length ?? 0) > 0 && (
              <div className="col-span-2">
                <p className="text-foreground-muted font-medium uppercase tracking-wide">Categories</p>
                <p className="font-medium text-foreground-body mt-0.5">
                  {location.productCategoryMapping?.join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* QR Code centered */}
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="p-3 bg-white rounded-xl border border-border">
              <QRCode value={qrData} size={140} level="M" />
            </div>
            <p className="text-xs text-foreground-muted text-center">
              Scan to view location details
            </p>
            <p className="text-xs font-mono text-foreground-muted break-all text-center max-w-xs">
              FR3SH · {location.type.toUpperCase()} · {location.code}
            </p>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-border print:hidden">
          <button onClick={onClose}
            className="flex-1 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-surface">
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary-hover"
          >
            <Printer className="h-4 w-4" /> Print Label
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Location Modal ─────────────────────────────────────────────────────────

const STORAGE_TYPES = ["Ambient", "Cold", "Cool", "Refrigerated", "Frozen"];
const LEVEL_TYPES = ["zone", "aisle", "rack", "shelf", "bin"];

function AddLocationModal({
  parentLocation,
  onClose,
  onSuccess,
}: {
  parentLocation?: Location | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const nextType = parentLocation
    ? LEVEL_TYPES[LEVEL_TYPES.indexOf(parentLocation.type) + 1] ?? "bin"
    : "zone";

  const [form, setForm] = useState({
    type: nextType,
    code: "",
    name: "",
    zoneCode: parentLocation?.zoneCode ?? parentLocation?.code ?? "",
    parentId: parentLocation?._id ?? "",
    storageType: parentLocation?.storageType ?? "Ambient",
    temperatureRange: parentLocation?.temperatureRange ?? "",
    capacityKg: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/wms/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${form.type} "${form.code}" created`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.message ?? "Failed to create location");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-heading/40 backdrop-blur-sm p-4">
      <div className="bg-surface-card rounded-2xl border border-border w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground-heading">
            Add {form.type.charAt(0).toUpperCase() + form.type.slice(1)}
            {parentLocation && <span className="font-normal text-foreground-muted"> in {parentLocation.code}</span>}
          </h2>
          <button onClick={onClose} className="text-foreground-muted text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Level</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none">
                {LEVEL_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Code *</label>
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none"
                placeholder={form.type === "zone" ? "e.g. A" : "e.g. A-01"} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-foreground-muted mb-1">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none"
                placeholder="e.g. Aisle 01 – Organic Rice" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Storage Type</label>
              <select value={form.storageType} onChange={(e) => setForm({ ...form, storageType: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none">
                {STORAGE_TYPES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Temperature Range</label>
              <input value={form.temperatureRange} onChange={(e) => setForm({ ...form, temperatureRange: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none"
                placeholder="e.g. 2–8°C" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Capacity (kg)</label>
              <input type="number" value={form.capacityKg} onChange={(e) => setForm({ ...form, capacityKg: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-border px-5 py-2 text-sm font-medium hover:bg-surface">Cancel</button>
            <button type="submit" disabled={submitting}
              className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover disabled:opacity-60">
              {submitting ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function LocationsPage() {
  const [zones, setZones] = useState<Location[]>([]);
  const [childLocations, setChildLocations] = useState<Location[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [printTarget, setPrintTarget] = useState<Location | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wms/locations?type=zone&withBatches=true");
      const data = await res.json();
      if (data.success) setZones(data.data);
    } catch { toast.error("Failed to load locations"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchZones(); }, [fetchZones]);

  const drillInto = useCallback(async (loc: Location) => {
    setLoadingDetail(true);
    setSelectedLocation(loc);

    // Build breadcrumb
    if (loc.type === "zone") {
      setBreadcrumb([{ id: loc._id, code: loc.code, name: loc.name, type: loc.type, zoneCode: loc.zoneCode }]);
    } else {
      setBreadcrumb((prev) => {
        const idx = prev.findIndex((b) => b.id === loc._id);
        if (idx !== -1) return prev.slice(0, idx + 1);
        return [...prev, { id: loc._id, code: loc.code, name: loc.name, type: loc.type, zoneCode: loc.zoneCode }];
      });
    }

    try {
      // Next level type
      const levelOrder = ["zone", "aisle", "rack", "shelf", "bin"];
      const nextType = levelOrder[levelOrder.indexOf(loc.type) + 1];

      const [childRes, batchRes] = await Promise.all([
        nextType
          ? fetch(`/api/wms/locations?type=${nextType}&parentId=${loc._id}`)
          : Promise.resolve(null),
        loc.type === "zone"
          ? fetch(`/api/wms/batches?zoneCode=${loc.zoneCode ?? loc.code}&limit=50`)
          : fetch(`/api/wms/batches?locationId=${loc._id}&limit=50`),
      ]);

      if (childRes) {
        const childData = await childRes.json();
        setChildLocations(childData.success ? childData.data : []);
      } else {
        setChildLocations([]);
      }

      const batchData = await batchRes.json();
      setBatches(batchData.success ? batchData.data : []);
    } catch { toast.error("Failed to load location details"); }
    finally { setLoadingDetail(false); }
  }, []);

  const navigateBreadcrumb = useCallback(async (item: BreadcrumbItem | null) => {
    if (!item) {
      // Back to warehouse (zone list)
      setSelectedLocation(null);
      setBreadcrumb([]);
      setChildLocations([]);
      setBatches([]);
      return;
    }
    // Find the location object from zones or childLocations
    const loc = zones.find((z) => z._id === item.id) ??
      childLocations.find((c) => c._id === item.id) ??
      { _id: item.id, code: item.code, name: item.name, type: item.type, zoneCode: item.zoneCode } as Location;

    const idx = breadcrumb.findIndex((b) => b.id === item.id);
    setBreadcrumb(breadcrumb.slice(0, idx + 1));
    await drillInto(loc as Location);
  }, [zones, childLocations, breadcrumb, drillInto]);

  const currentZone = breadcrumb[0] ? zones.find((z) => z._id === breadcrumb[0].id) : null;
  const isAtZoneList = !selectedLocation;

  const usedPct = selectedLocation && selectedLocation.capacityKg
    ? Math.min(100, Math.round((selectedLocation.currentOccupancy / selectedLocation.capacityKg) * 100))
    : null;

  return (
    <div className="space-y-6">
      {/* Print styles injected via style tag */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-label { display: block !important; }
          #print-label * { display: revert !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" /> Warehouse Locations
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Hierarchy: Warehouse → Zone → Aisle → Rack → Shelf → Bin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchZones}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-foreground-muted hover:bg-secondary-subtle">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-hover">
            <Plus className="h-4 w-4" /> Add Location
          </button>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-1.5 text-sm flex-wrap">
          <button
            onClick={() => navigateBreadcrumb(null)}
            className="flex items-center gap-1 text-foreground-muted hover:text-foreground-heading transition-colors"
          >
            <Home className="h-3.5 w-3.5" /> Warehouse
          </button>
          {breadcrumb.map((b, i) => (
            <React.Fragment key={b.id}>
              <ChevronRight className="h-3.5 w-3.5 text-foreground-muted" />
              <button
                onClick={() => navigateBreadcrumb(b)}
                className={`font-medium transition-colors ${
                  i === breadcrumb.length - 1
                    ? "text-primary"
                    : "text-foreground-muted hover:text-foreground-heading"
                }`}
              >
                {b.code} — {b.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ── Zone List (top level) ── */}
      {isAtZoneList && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-20 text-foreground-muted gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" /> Loading zones…
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((zone) => {
                const occ = zone.currentOccupancy ?? 0;
                const cap = zone.capacityKg ?? 100;
                const pct = Math.min(100, Math.round((occ / cap) * 100));

                return (
                  <div
                    key={zone._id}
                    onClick={() => drillInto(zone)}
                    className="rounded-2xl bg-surface-card border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shrink-0">
                          {zone.code}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground-heading">{zone.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[zone.storageType]}`}>
                              {zone.storageType}
                            </span>
                            {zone.temperatureRange && (
                              <span className="flex items-center gap-1 text-xs text-foreground-muted">
                                <Thermometer className="h-3 w-3" /> {zone.temperatureRange}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-foreground-muted mt-1 group-hover:text-primary transition-colors" />
                    </div>

                    {/* Batch count */}
                    {(zone.batchCount ?? 0) > 0 && (
                      <div className="flex items-center gap-1.5 mb-2 text-xs text-foreground-muted">
                        <Package className="h-3 w-3" />
                        <span>{zone.batchCount} active batch{zone.batchCount !== 1 ? "es" : ""}</span>
                        <span>·</span>
                        <span className="font-medium text-foreground-body">
                          {zone.totalQtyAvailable?.toLocaleString() ?? 0} units available
                        </span>
                      </div>
                    )}

                    {/* Occupancy bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-foreground-muted">
                        <span>{zone.productCategoryMapping?.[0] ?? "General"}</span>
                        <span className={`font-bold ${pct >= 90 ? "text-status-danger" : pct >= 70 ? "text-status-warning" : "text-status-success"}`}>
                          {pct}% used
                        </span>
                      </div>
                      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-status-danger" : pct >= 70 ? "bg-status-warning" : "bg-primary"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); setPrintTarget(zone); }}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-secondary-subtle"
                      >
                        <QrCode className="h-3 w-3" /> Print Labels
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); drillInto(zone); }}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-secondary-subtle"
                      >
                        View Contents
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Drill-down Detail View ── */}
      {selectedLocation && (
        <div className="space-y-5">
          {/* Back button + location header */}
          <div className="flex items-start justify-between gap-4">
            <button
              onClick={() => navigateBreadcrumb(breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2] : null)}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm text-foreground-muted hover:bg-secondary-subtle shrink-0"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shrink-0">
                  {selectedLocation.code.split("-")[0]}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground-heading">{selectedLocation.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="font-mono text-xs text-foreground-muted">{selectedLocation.code}</span>
                    <span className="text-foreground-muted">·</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[selectedLocation.storageType]}`}>
                      {selectedLocation.storageType}
                    </span>
                    {selectedLocation.temperatureRange && (
                      <span className="flex items-center gap-1 text-xs text-foreground-muted">
                        <Thermometer className="h-3 w-3" /> {selectedLocation.temperatureRange}
                      </span>
                    )}
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs text-foreground-muted capitalize">
                      {TYPE_ICON_LABEL[selectedLocation.type] ?? selectedLocation.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setPrintTarget(selectedLocation)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-secondary-subtle shrink-0"
            >
              <Printer className="h-4 w-4" /> Print Label
            </button>
          </div>

          {loadingDetail ? (
            <div className="flex items-center justify-center py-16 text-foreground-muted gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* ── Left: Sub-locations ── */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-foreground-heading flex items-center gap-2 text-sm">
                      <Layers className="h-4 w-4 text-primary" />
                      {childLocations.length > 0
                        ? `${childLocations.length} Sub-Location${childLocations.length !== 1 ? "s" : ""}`
                        : "Sub-Locations"}
                    </h3>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-2.5 py-1 text-xs font-medium hover:bg-primary-hover"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>

                  {childLocations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-foreground-muted gap-2">
                      <Box className="h-8 w-8 opacity-40" />
                      <p className="text-sm">No sub-locations yet</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        Add first sub-location
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {childLocations.map((child) => (
                        <button
                          key={child._id}
                          onClick={() => drillInto(child)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface transition-colors text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-subtle text-foreground-heading font-bold text-xs shrink-0">
                              {child.code.split("-").pop()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground-heading">{child.name}</p>
                              <p className="text-xs text-foreground-muted font-mono">{child.code}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[child.storageType]}`}>
                              {child.storageType}
                            </span>
                            <ChevronRight className="h-4 w-4 text-foreground-muted group-hover:text-primary" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Right: Inventory Batches ── */}
              <div className="lg:col-span-3 space-y-4">
                <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-foreground-heading flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-primary" />
                      {batches.length > 0
                        ? `${batches.length} Inventory Batch${batches.length !== 1 ? "es" : ""}`
                        : "Inventory Batches"}
                    </h3>
                    {batches.length > 0 && (
                      <span className="text-xs text-foreground-muted">
                        {batches.reduce((sum, b) => sum + b.quantityAvailable, 0).toLocaleString()} total units
                      </span>
                    )}
                  </div>

                  {batches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-foreground-muted gap-2">
                      <Package className="h-8 w-8 opacity-40" />
                      <p className="text-sm">No inventory in this location yet</p>
                      <p className="text-xs text-center max-w-xs">
                        Batches appear here after inward entries pass quality check
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {batches.map((batch) => {
                        const daysToExpiry = batch.expiryDate
                          ? Math.floor((new Date(batch.expiryDate).getTime() - Date.now()) / 86400000)
                          : null;

                        return (
                          <div key={batch._id} className="px-4 py-3 hover:bg-surface transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-foreground-heading text-sm truncate">
                                    {batch.productName}
                                  </span>
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BATCH_STATUS_BADGE[batch.status] ?? "bg-tertiary text-tertiary-foreground"}`}>
                                    {batch.status}
                                  </span>
                                  {daysToExpiry !== null && daysToExpiry <= 7 && (
                                    <span className="flex items-center gap-1 text-xs text-status-danger font-medium">
                                      <AlertTriangle className="h-3 w-3" />
                                      Expires in {daysToExpiry}d
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-foreground-muted flex-wrap">
                                  <span className="font-mono text-primary">{batch.skuCode}</span>
                                  <span>·</span>
                                  <span className="font-mono">{batch.batchId}</span>
                                  <span>·</span>
                                  <span>{batch.farmerName}</span>
                                </div>
                                {batch.currentLocationLabel && (
                                  <p className="text-xs text-foreground-muted mt-0.5">
                                    📍 {batch.currentLocationLabel}
                                  </p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-bold text-foreground-heading text-sm">
                                  {batch.quantityAvailable.toLocaleString()}
                                  <span className="text-xs font-normal text-foreground-muted ml-1">{batch.unit}</span>
                                </p>
                                <p className="text-xs text-foreground-muted">
                                  of {batch.quantityTotal} total
                                </p>
                                {batch.expiryDate && (
                                  <p className={`text-xs mt-0.5 ${daysToExpiry !== null && daysToExpiry <= 7 ? "text-status-danger font-medium" : "text-foreground-muted"}`}>
                                    Exp: {new Date(batch.expiryDate).toLocaleDateString("en-IN")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {printTarget && (
        <PrintLabelModal location={printTarget} onClose={() => setPrintTarget(null)} />
      )}
      {showAddModal && (
        <AddLocationModal
          parentLocation={selectedLocation}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchZones();
            if (selectedLocation) drillInto(selectedLocation);
          }}
        />
      )}
    </div>
  );
}
