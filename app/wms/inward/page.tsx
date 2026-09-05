"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { PackageOpen, Plus, Search, Filter, RefreshCw, Zap } from "lucide-react";
import toast from "react-hot-toast";

const UNITS = ["kg", "g", "litre", "ml", "packet", "box", "crate", "bundle", "dozen", "piece"];
const TRANSPORT_CONDITIONS = ["Good", "Slightly Damaged Packaging", "Temperature Deviation", "Delay – Same Day", "Delay – Next Day", "Other"];

const STATUS_BADGE: Record<string, string> = {
  "QC Pending": "bg-status-warning-surface text-status-warning",
  Accepted: "bg-status-success-surface text-status-success",
  "Partially Accepted": "bg-status-info-surface text-status-info",
  Putaway: "bg-status-info-surface text-status-info",
  Rejected: "bg-status-danger-surface text-status-danger",
};

interface FarmerOption {
  farmerId: string;
  name: string;
  type: string;
  state?: string;
  organicCertNumber?: string;
}

interface ProductOption {
  _id: string;
  skuPrefix: string;
  skuBase: string;
  productName: string;
  category: string;
  zoneCode: string;
  defaultUnit: string;
  shelfLifeDays: number;
  storageType: string;
}

interface InwardEntry {
  _id: string;
  entryId: string;
  farmerName: string;
  productName: string;
  skuCode?: string;
  quantityReceived: number;
  unit: string;
  batchId: string;
  harvestDate?: string;
  receivedDate: string;
  expectedShelfLifeDays?: number;
  status: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function NewInwardModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    farmer: "",
    farmerId: "",
    product: "",
    productId: "",
    sku: "",
    skuBase: "",
    qty: "",
    unit: "kg",
    harvestDate: "",
    expectedShelfLife: "",
    transportCondition: "Good",
    purchasePrice: "",
    notes: "",
  });

  const [farmers, setFarmers] = useState<FarmerOption[]>([]);
  const [farmerSearch, setFarmerSearch] = useState("");
  const [showFarmerDropdown, setShowFarmerDropdown] = useState(false);

  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductOption[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const farmerRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);

  const debouncedProductSearch = useDebounce(productSearch, 280);

  // Load all farmers on mount
  useEffect(() => {
    fetch("/api/wms/farmers")
      .then((r) => r.json())
      .then((d) => { if (d.success) setFarmers(d.data); })
      .catch(() => {})
      .finally(() => setLoadingFarmers(false));
  }, []);

  // Search products when user types
  useEffect(() => {
    if (!debouncedProductSearch || form.productId) return;
    setLoadingProducts(true);
    fetch(`/api/wms/products?q=${encodeURIComponent(debouncedProductSearch)}&limit=8`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setProductResults(d.data); })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, [debouncedProductSearch, form.productId]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (farmerRef.current && !farmerRef.current.contains(e.target as Node)) setShowFarmerDropdown(false);
      if (productRef.current && !productRef.current.contains(e.target as Node)) setShowProductDropdown(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredFarmers = farmerSearch
    ? farmers.filter((f) => f.name.toLowerCase().includes(farmerSearch.toLowerCase()))
    : farmers;

  const handleFarmerSelect = (f: FarmerOption) => {
    setFarmerSearch(f.name);
    setForm((prev) => ({ ...prev, farmer: f.name, farmerId: f.farmerId }));
    setShowFarmerDropdown(false);
  };

  const handleProductSelect = (p: ProductOption) => {
    setProductSearch(p.productName);
    setForm((prev) => ({
      ...prev,
      product: p.productName,
      productId: p._id,
      skuBase: p.skuBase,
      sku: "",
      unit: p.defaultUnit,
      expectedShelfLife: String(p.shelfLifeDays),
    }));
    setShowProductDropdown(false);
    setProductResults([]);
  };

  const handleProductClear = () => {
    setProductSearch("");
    setForm((prev) => ({ ...prev, product: "", productId: "", skuBase: "", sku: "" }));
    setProductResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.farmer) { toast.error("Please select a farmer / FPO"); return; }
    if (!form.product) { toast.error("Product name is required"); return; }
    if (!form.qty || Number(form.qty) <= 0) { toast.error("Valid quantity is required"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/wms/inward", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        const skuInfo = data.data.skuCode ? ` · SKU: ${data.data.skuCode}` : "";
        toast.success(`Entry created${skuInfo} — QC pending`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.message ?? "Failed to create entry");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const skuIsAutoGenerated = !!form.skuBase && !form.sku;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground-heading/40 backdrop-blur-sm p-4">
      <div className="bg-surface-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground-heading text-lg">New Inward Entry</h2>
          <button onClick={onClose} className="text-foreground-muted hover:text-foreground-heading text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Farmer combobox */}
            <div ref={farmerRef} className="relative">
              <label className="block text-xs font-medium text-foreground-muted mb-1">Farmer / Supplier *</label>
              {loadingFarmers ? (
                <div className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground-muted">Loading…</div>
              ) : (
                <>
                  <input
                    required
                    value={farmerSearch}
                    onFocus={() => setShowFarmerDropdown(true)}
                    onChange={(e) => {
                      setFarmerSearch(e.target.value);
                      setForm((prev) => ({ ...prev, farmer: e.target.value, farmerId: "" }));
                      setShowFarmerDropdown(true);
                    }}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                    placeholder="Search farmer or FPO…"
                  />
                  {showFarmerDropdown && filteredFarmers.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-surface-card shadow-lg max-h-44 overflow-y-auto text-sm">
                      {filteredFarmers.slice(0, 10).map((f) => (
                        <li
                          key={f.farmerId}
                          className="px-3 py-2 hover:bg-secondary-subtle cursor-pointer flex items-center justify-between gap-2"
                          onMouseDown={() => handleFarmerSelect(f)}
                        >
                          <span className="font-medium text-foreground-heading truncate">{f.name}</span>
                          <span className="text-xs text-foreground-muted shrink-0">{f.type}{f.state ? ` · ${f.state}` : ""}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>

            {/* Product combobox */}
            <div ref={productRef} className="relative">
              <label className="block text-xs font-medium text-foreground-muted mb-1">Product *</label>
              <div className="flex gap-1.5">
                <input
                  required
                  value={productSearch}
                  onFocus={() => { if (productResults.length > 0) setShowProductDropdown(true); }}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setForm((prev) => ({ ...prev, product: e.target.value, productId: "", skuBase: "", sku: "" }));
                    setShowProductDropdown(true);
                  }}
                  className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                  placeholder="Search product catalog…"
                />
                {form.productId && (
                  <button type="button" onClick={handleProductClear}
                    className="px-2.5 rounded-xl border border-border text-foreground-muted hover:text-status-danger text-lg leading-none">
                    ×
                  </button>
                )}
              </div>
              {showProductDropdown && (productResults.length > 0 || loadingProducts) && (
                <ul className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-surface-card shadow-lg max-h-52 overflow-y-auto text-sm">
                  {loadingProducts ? (
                    <li className="px-3 py-3 text-foreground-muted text-center">Searching…</li>
                  ) : (
                    productResults.map((p) => (
                      <li
                        key={p._id}
                        className="px-3 py-2 hover:bg-secondary-subtle cursor-pointer"
                        onMouseDown={() => handleProductSelect(p)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground-heading truncate">{p.productName}</span>
                          <span className="font-mono text-xs text-primary shrink-0">{p.skuPrefix}</span>
                        </div>
                        <div className="text-xs text-foreground-muted mt-0.5">
                          {p.category} · Zone {p.zoneCode} · {p.storageType} · {p.defaultUnit}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            {/* SKU field */}
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1">
                SKU / Barcode
                {form.skuBase && (
                  <span className="ml-1.5 text-xs text-foreground-muted">
                    (base: <span className="font-mono text-primary">{form.skuBase}</span>)
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus pr-24"
                  placeholder={form.skuBase ? `${form.skuBase}NNNN` : "FR3SH-A-0001"}
                />
                {skuIsAutoGenerated && (
                  <span className="absolute right-2.5 top-1.5 inline-flex items-center gap-1 rounded-md bg-status-success-surface text-status-success text-xs px-2 py-0.5 font-medium">
                    <Zap className="h-3 w-3" /> Auto
                  </span>
                )}
              </div>
              {skuIsAutoGenerated && (
                <p className="text-xs text-foreground-muted mt-0.5">
                  SKU will be auto-assigned as next <span className="font-mono text-primary">{form.skuBase}NNNN</span>
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-foreground-muted mb-1">Quantity *</label>
                <input required type="number" min="0.01" step="0.01" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })}
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

          <div className="flex justify-end gap-3 pt-1 border-t border-border">
            <button type="button" onClick={onClose} className="rounded-xl border border-border px-5 py-2 text-sm font-medium hover:bg-surface">Cancel</button>
            <button type="submit" disabled={submitting}
              className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover disabled:opacity-60">
              {submitting ? "Submitting…" : "Submit Inward"}
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
  const [entries, setEntries] = useState<InwardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wms/inward?limit=50");
      const data = await res.json();
      if (data.success) {
        setEntries(data.data);
        setTotal(data.total);
      }
    } catch {
      toast.error("Failed to load inward entries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const filtered = entries.filter(
    (e) =>
      e.productName.toLowerCase().includes(search.toLowerCase()) ||
      e.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      e.entryId.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
            <PackageOpen className="h-6 w-6 text-primary" /> Inward / Stock Receiving
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Receive and record incoming produce from farmers &amp; FPOs
            {total > 0 && <span className="ml-2 text-foreground-heading font-medium">({total} entries)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEntries}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-foreground-muted hover:bg-secondary-subtle"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> New Inward Entry
          </button>
        </div>
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
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-foreground-muted">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading entries…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-foreground-muted">
                    {search ? "No entries match your search" : "No inward entries yet — create your first one"}
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e._id} className="hover:bg-surface transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{e.entryId}</td>
                    <td className="px-4 py-3 text-foreground-body">{e.farmerName}</td>
                    <td className="px-4 py-3 font-medium text-foreground-heading">{e.productName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{e.skuCode ?? "—"}</td>
                    <td className="px-4 py-3">{e.quantityReceived} {e.unit}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground-muted">{e.batchId}</td>
                    <td className="px-4 py-3 text-foreground-body">
                      {e.harvestDate ? new Date(e.harvestDate).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground-body">
                      {new Date(e.receivedDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-foreground-body">
                      {e.expectedShelfLifeDays ? `${e.expectedShelfLifeDays}d` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[e.status] ?? "bg-tertiary text-tertiary-foreground"}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <NewInwardModal onClose={() => setShowModal(false)} onSuccess={fetchEntries} />}
    </div>
  );
}
