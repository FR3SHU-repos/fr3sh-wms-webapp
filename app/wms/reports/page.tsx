import { BarChart3, Download, TrendingUp, TrendingDown, AlertTriangle, Package, Truck, ClipboardCheck } from "lucide-react";

const REPORT_CARDS = [
  { title: "Stock Value Report", desc: "Total inventory value by category, farmer, and location", icon: BarChart3, href: "/api/wms/reports/stock-value" },
  { title: "Product Movement", desc: "Inflows, outflows, picks, packs per SKU and batch", icon: TrendingUp, href: "/api/wms/reports/movement" },
  { title: "Farmer-wise Stock", desc: "Stock breakdown attributed to each farmer / FPO", icon: Package, href: "/api/wms/reports/farmer-stock" },
  { title: "Expiry Loss Report", desc: "Expired and near-expiry stock write-offs", icon: AlertTriangle, href: "/api/wms/reports/expiry" },
  { title: "Damaged Stock", desc: "All damage records with photos and approvals", icon: TrendingDown, href: "/api/wms/reports/damaged" },
  { title: "Order Fulfilment Time", desc: "Average time from order to dispatch by date range", icon: Truck, href: "/api/wms/reports/fulfilment-time" },
  { title: "Picking Accuracy", desc: "Correct vs. incorrect picks, picker performance", icon: ClipboardCheck, href: "/api/wms/reports/picking-accuracy" },
  { title: "Warehouse Capacity", desc: "Zone-wise occupancy over time", icon: BarChart3, href: "/api/wms/reports/capacity" },
  { title: "Best-Selling Products", desc: "Top-moving SKUs by volume and value", icon: TrendingUp, href: "/api/wms/reports/bestsellers" },
  { title: "Slow-Moving Products", desc: "Dead stock and aged inventory", icon: TrendingDown, href: "/api/wms/reports/slowmoving" },
  { title: "QC Rejection Rate", desc: "Rejection trends by farmer, product, and season", icon: ClipboardCheck, href: "/api/wms/reports/qc-rejection" },
  { title: "Inward Summary", desc: "Received stock volume by date range and supplier", icon: Package, href: "/api/wms/reports/inward" },
];

const SUMMARY_STATS = [
  { label: "Total Inventory Value", value: "₹12.4L", trend: "+8% vs last week", up: true },
  { label: "Orders Fulfilled (MTD)", value: "486", trend: "+12% vs last month", up: true },
  { label: "QC Rejection Rate", value: "4.2%", trend: "-1.1% vs last month", up: false },
  { label: "Avg Dispatch Time", value: "1.8 hrs", trend: "-0.4 hrs vs last week", up: false },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> Reports & Analytics
        </h1>
        <p className="text-sm text-foreground-muted mt-1">Operational insights for the FR3SH warehouse</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {SUMMARY_STATS.map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface-card border border-border p-5">
            <p className="text-xs text-foreground-muted font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-foreground-heading mt-1">{s.value}</p>
            <p className={`text-xs mt-1 flex items-center gap-1 ${s.up ? "text-status-success" : "text-status-danger"}`}>
              {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {s.trend}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-semibold text-foreground-heading mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_CARDS.map((r) => (
            <div key={r.title} className="rounded-2xl bg-surface-card border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface">
                  <r.icon className="h-5 w-5 text-primary" />
                </div>
                <button className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-secondary-subtle">
                  <Download className="h-3 w-3" /> Export
                </button>
              </div>
              <h3 className="font-semibold text-foreground-heading">{r.title}</h3>
              <p className="text-xs text-foreground-muted mt-1">{r.desc}</p>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-xl bg-primary text-primary-foreground py-2 text-xs font-medium hover:bg-primary-hover">
                  View Report
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-surface-card border border-border p-6">
        <h2 className="font-semibold text-foreground-heading mb-4">Custom Date Range Report</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">Report Type</label>
            <select className="rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus">
              {REPORT_CARDS.map((r) => <option key={r.title}>{r.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">From Date</label>
            <input type="date" className="rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground-muted mb-1">To Date</label>
            <input type="date" className="rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus" />
          </div>
          <button className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover">
            Generate
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2 text-sm font-medium hover:bg-secondary-subtle">
            <Download className="h-4 w-4" /> Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}
