"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, Plus, Search, RefreshCw, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const ZONE_CATEGORIES = [
  { code: "A", name: "Rice & Grains", storageType: "Ambient" },
  { code: "B", name: "Millets", storageType: "Ambient" },
  { code: "C", name: "Fresh Fruits", storageType: "Cold" },
  { code: "D", name: "Vegetables", storageType: "Cold" },
  { code: "E", name: "Leafy Greens", storageType: "Cold" },
  { code: "F", name: "Beans & Fresh Legumes", storageType: "Cold" },
  { code: "G", name: "Pulses & Lentils", storageType: "Ambient" },
  { code: "H", name: "Culinary Herbs", storageType: "Ambient" },
  { code: "I", name: "Spices", storageType: "Ambient" },
  { code: "J", name: "Seeds", storageType: "Ambient" },
  { code: "K", name: "Dry Fruits & Nuts", storageType: "Ambient" },
  { code: "L", name: "Cold-Pressed Oils", storageType: "Cool" },
  { code: "M", name: "Natural Sweeteners", storageType: "Ambient" },
  { code: "N", name: "Flours & Powders", storageType: "Ambient" },
  { code: "O", name: "Organic Beverages", storageType: "Ambient" },
  { code: "P", name: "Pickles & Ferments", storageType: "Cool" },
  { code: "Q", name: "Dairy", storageType: "Refrigerated" },
  { code: "R", name: "Eggs", storageType: "Refrigerated" },
  { code: "S", name: "Meat & Poultry", storageType: "Refrigerated" },
  { code: "T", name: "Seafood", storageType: "Refrigerated" },
  { code: "U", name: "Mushrooms", storageType: "Cold" },
  { code: "V", name: "Microgreens & Sprouts", storageType: "Cold" },
  { code: "W", name: "Edible Flowers", storageType: "Cold" },
  { code: "X", name: "Processed Foods", storageType: "Ambient" },
  { code: "Y", name: "Ready-to-Cook Mixes", storageType: "Ambient" },
  { code: "Z", name: "Condiments & Misc Food", storageType: "Ambient" },
];

const UNITS = ["kg", "g", "litre", "ml", "packet", "box", "crate", "bundle", "dozen", "piece"];
const STORAGE_TYPES = ["Ambient", "Cold", "Cool", "Refrigerated", "Frozen"];
const GRADES = ["Premium", "Standard", "Economy"];

interface Product {
  _id: string;
  skuPrefix: string;
  skuBase: string;
  zoneCode: string;
  category: string;
  subcategory: string;
  productName: string;
  grade: string;
  form: string;
  defaultUnit: string;
  storageType: string;
  shelfLifeDays: number;
  organicCertRequired: boolean;
  seasonal: boolean;
  isActive: boolean;
}

const STORAGE_BADGE: Record<string, string> = {
  Ambient: "bg-amber-50 text-amber-700",
  Cold: "bg-blue-50 text-blue-700",
  Cool: "bg-cyan-50 text-cyan-700",
  Refrigerated: "bg-indigo-50 text-indigo-700",
  Frozen: "bg-purple-50 text-purple-700",
};

function NewProductModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    zoneCode: "A",
    category: "Rice & Grains",
    subcategory: "",
    productName: "",
    grade: "Standard",
    form: "Whole",
    defaultUnit: "kg",
    storageType: "Ambient",
    shelfLifeDays: "365",
    hsnCode: "",
    gstPercent: "",
    minimumOrderQty: "1",
    organicCertRequired: true,
    fssaiRequired: true,
    seasonal: false,
    mainSeason: "Year-round",
    stateAvailability: "",
    recommendedPackaging: "",
    qualityChecks: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const skuBase = `FR3SH-${form.zoneCode}-`;

  const handleZoneChange = (zoneCode: string) => {
    const zone = ZONE_CATEGORIES.find((z) => z.code === zoneCode);
    setForm((prev) => ({
      ...prev,
      zoneCode,
      category: zone?.name ?? prev.category,
      storageType: zone?.storageType ?? prev.storageType,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/wms/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Product created — SKU: ${data.data.skuPrefix}`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.message ?? "Failed to create product");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-heading/40 backdrop-blur-sm p-4">
      <div className="bg-surface-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground-heading text-lg">New Product</h2>
          <button onClick={onClose} className="text-foreground-muted hover:text-foreground-heading text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Auto-assigned SKU preview */}
          <div className="rounded-xl bg-secondary-subtle border border-border px-4 py-3 flex items-center gap-3">
            <div>
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Auto-assigned SKU Prefix</p>
              <p className="text-lg font-mono font-bold text-primary mt-0.5">
                {skuBase}<span className="text-foreground-muted text-sm">NNNN</span>
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-foreground-muted">Zone</p>
              <p className="text-sm font-bold text-foreground-heading">{form.zoneCode} — {form.category}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Zone / Category *</label>
              <div className="relative">
                <select
                  value={form.zoneCode}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus appearance-none pr-8"
                >
                  {ZONE_CATEGORIES.map((z) => (
                    <option key={z.code} value={z.code}>
                      {z.code} — {z.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-foreground-muted pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Product Name *</label>
              <input
                required
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                placeholder="e.g. Organic Sona Masoori Rice"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Subcategory</label>
              <input
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                placeholder="e.g. Sona Masoori"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Form</label>
              <input
                value={form.form}
                onChange={(e) => setForm({ ...form, form: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                placeholder="e.g. Whole, Ground, Liquid, Powder"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Grade</label>
              <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus">
                {GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-foreground-muted mb-1">Default Unit *</label>
                <select value={form.defaultUnit} onChange={(e) => setForm({ ...form, defaultUnit: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus">
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-foreground-muted mb-1">Storage Type *</label>
                <select value={form.storageType} onChange={(e) => setForm({ ...form, storageType: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus">
                  {STORAGE_TYPES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Shelf Life (days)</label>
              <input type="number" value={form.shelfLifeDays} onChange={(e) => setForm({ ...form, shelfLifeDays: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Min Order Qty</label>
              <input type="number" min="0.01" step="0.01" value={form.minimumOrderQty} onChange={(e) => setForm({ ...form, minimumOrderQty: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">HSN Code</label>
              <input value={form.hsnCode} onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder="e.g. 1006" />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">GST %</label>
              <input value={form.gstPercent} onChange={(e) => setForm({ ...form, gstPercent: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder="e.g. 5 or 0/5" />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">State Availability</label>
              <input value={form.stateAvailability} onChange={(e) => setForm({ ...form, stateAvailability: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder="e.g. Assam, Telangana" />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">Recommended Packaging</label>
              <input value={form.recommendedPackaging} onChange={(e) => setForm({ ...form, recommendedPackaging: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" placeholder="e.g. Glass Jar, Vacuum Pack" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Quality Checks</label>
            <textarea rows={2} value={form.qualityChecks} onChange={(e) => setForm({ ...form, qualityChecks: e.target.value })}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus resize-none"
              placeholder="e.g. Organic certificate, moisture check, visual grading" />
          </div>

          <div className="flex gap-6 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.organicCertRequired}
                onChange={(e) => setForm({ ...form, organicCertRequired: e.target.checked })}
                className="rounded" />
              <span className="text-sm text-foreground-body">Organic Cert Required</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.fssaiRequired}
                onChange={(e) => setForm({ ...form, fssaiRequired: e.target.checked })}
                className="rounded" />
              <span className="text-sm text-foreground-body">FSSAI Required</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.seasonal}
                onChange={(e) => setForm({ ...form, seasonal: e.target.checked })}
                className="rounded" />
              <span className="text-sm text-foreground-body">Seasonal</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-1 border-t border-border">
            <button type="button" onClick={onClose} className="rounded-xl border border-border px-5 py-2 text-sm font-medium hover:bg-surface">Cancel</button>
            <button type="submit" disabled={submitting}
              className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover disabled:opacity-60">
              {submitting ? "Creating…" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(page) });
      if (search) params.set("q", search);
      if (zoneFilter) params.set("zone", zoneFilter);
      const res = await fetch(`/api/wms/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setTotal(data.total);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search, zoneFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> Product Catalog
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Manage products and their SKU prefixes
            {total > 0 && <span className="ml-2 font-medium text-foreground-heading">({total} products)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchProducts}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-foreground-muted hover:bg-secondary-subtle">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-hover">
            <Plus className="h-4 w-4" /> New Product
          </button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 flex items-center gap-2 rounded-xl border border-border bg-surface-card px-3 py-2">
          <Search className="h-4 w-4 text-foreground-muted shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, SKU, category…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-muted"
          />
        </div>
        <div className="relative">
          <select
            value={zoneFilter}
            onChange={(e) => { setZoneFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-foreground-muted pr-8 appearance-none focus:outline-none"
          >
            <option value="">All Zones</option>
            {ZONE_CATEGORIES.map((z) => (
              <option key={z.code} value={z.code}>{z.code} — {z.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-foreground-muted pointer-events-none" />
        </div>
      </div>

      <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-foreground-muted">
                {["SKU", "SKU Base", "Product Name", "Category", "Zone", "Unit", "Storage", "Shelf Life", "Organic"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-foreground-muted">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading products…
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-foreground-muted">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-primary font-medium">{p.skuPrefix}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{p.skuBase}</td>
                    <td className="px-4 py-3 font-medium text-foreground-heading max-w-48 truncate">{p.productName}</td>
                    <td className="px-4 py-3 text-foreground-body text-xs">{p.category}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">{p.zoneCode}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">{p.defaultUnit}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STORAGE_BADGE[p.storageType] ?? "bg-tertiary text-tertiary-foreground"}`}>
                        {p.storageType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">{p.shelfLifeDays}d</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${p.organicCertRequired ? "text-status-success" : "text-foreground-muted"}`}>
                        {p.organicCertRequired ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-foreground-muted">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-lg border border-border px-3 py-1 text-xs disabled:opacity-40 hover:bg-secondary-subtle">
                Previous
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page * PAGE_SIZE >= total}
                className="rounded-lg border border-border px-3 py-1 text-xs disabled:opacity-40 hover:bg-secondary-subtle">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && <NewProductModal onClose={() => setShowModal(false)} onSuccess={fetchProducts} />}
    </div>
  );
}
