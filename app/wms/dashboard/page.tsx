import {
  PackageOpen,
  ClipboardCheck,
  ShoppingCart,
  Package,
  Truck,
  AlertTriangle,
  Clock,
  Trash2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Boxes,
} from "lucide-react";

const STAT_CARDS = [
  {
    label: "Today's Inbound",
    value: "24 lots",
    sub: "↑ 6 from yesterday",
    icon: PackageOpen,
    color: "text-status-info",
    bg: "bg-status-info-surface",
  },
  {
    label: "Pending QC",
    value: "8 batches",
    sub: "3 awaiting lab test",
    icon: ClipboardCheck,
    color: "text-status-warning",
    bg: "bg-status-warning-surface",
  },
  {
    label: "Orders to Pick",
    value: "42 orders",
    sub: "12 high priority",
    icon: ShoppingCart,
    color: "text-primary",
    bg: "bg-surface",
  },
  {
    label: "Orders to Pack",
    value: "19 orders",
    sub: "All within SLA",
    icon: Package,
    color: "text-brand",
    bg: "bg-surface",
  },
  {
    label: "Dispatch Pending",
    value: "31 parcels",
    sub: "Courier pickup at 4 PM",
    icon: Truck,
    color: "text-status-success",
    bg: "bg-status-success-surface",
  },
  {
    label: "Low Stock Alerts",
    value: "7 SKUs",
    sub: "Reorder recommended",
    icon: AlertTriangle,
    color: "text-status-warning",
    bg: "bg-status-warning-surface",
  },
  {
    label: "Near Expiry",
    value: "5 batches",
    sub: "Expiring in ≤ 7 days",
    icon: Clock,
    color: "text-status-danger",
    bg: "bg-status-danger-surface",
  },
  {
    label: "Damaged Stock",
    value: "3 items",
    sub: "Pending disposal approval",
    icon: Trash2,
    color: "text-status-danger",
    bg: "bg-status-danger-surface",
  },
];

const RECENT_INWARD = [
  { id: "INW-2026-0041", farmer: "Ramaiah FPO, Nalgonda", product: "Organic Turmeric", qty: "200 kg", status: "QC Pending", time: "9:14 AM" },
  { id: "INW-2026-0040", farmer: "Srinivas Farm, Kurnool", product: "Foxtail Millet", qty: "150 kg", status: "Accepted", time: "8:50 AM" },
  { id: "INW-2026-0039", farmer: "Green Valley FPO", product: "Organic Rice – Sona Masoori", qty: "500 kg", status: "Putaway", time: "8:20 AM" },
  { id: "INW-2026-0038", farmer: "Kavitha Organics", product: "Cold-Pressed Coconut Oil", qty: "60 L", status: "QC Pending", time: "7:55 AM" },
  { id: "INW-2026-0037", farmer: "Satya FPO, Warangal", product: "Toor Dal", qty: "300 kg", status: "Accepted", time: "7:30 AM" },
];

const CAPACITY_ZONES = [
  { zone: "A – Rice & Grains", used: 72, color: "bg-primary" },
  { zone: "B – Millets", used: 45, color: "bg-brand" },
  { zone: "D – Vegetables", used: 88, color: "bg-status-danger" },
  { zone: "G – Pulses & Lentils", used: 61, color: "bg-status-warning" },
  { zone: "I – Spices", used: 38, color: "bg-status-success" },
  { zone: "L – Cold-Pressed Oils", used: 55, color: "bg-status-info" },
];

const STATUS_BADGE: Record<string, string> = {
  "QC Pending": "bg-status-warning-surface text-status-warning",
  Accepted: "bg-status-success-surface text-status-success",
  Putaway: "bg-status-info-surface text-status-info",
  Rejected: "bg-status-danger-surface text-status-danger",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground-heading">Warehouse Dashboard</h1>
        <p className="text-sm text-foreground-muted mt-1">
          Today · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="rounded-2xl bg-surface-card border border-border p-5 flex items-start gap-4">
            <div className={`rounded-xl p-2.5 ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-foreground-muted font-medium truncate">{card.label}</p>
              <p className="text-xl font-bold text-foreground-heading mt-0.5">{card.value}</p>
              <p className="text-xs text-foreground-muted mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent inward */}
        <div className="lg:col-span-2 rounded-2xl bg-surface-card border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground-heading flex items-center gap-2">
              <PackageOpen className="h-4 w-4 text-brand" />
              Recent Inward
            </h2>
            <a href="/wms/inward" className="text-xs text-primary font-medium hover:underline">
              View all
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface text-foreground-muted">
                  <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wide">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">Farmer / FPO</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">Qty</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {RECENT_INWARD.map((row) => (
                  <tr key={row.id} className="hover:bg-surface transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-foreground-muted">{row.id}</td>
                    <td className="px-4 py-3 text-foreground-body">{row.farmer}</td>
                    <td className="px-4 py-3 font-medium text-foreground-heading">{row.product}</td>
                    <td className="px-4 py-3 text-foreground-body">{row.qty}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[row.status] ?? "bg-tertiary text-tertiary-foreground"}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted text-xs">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Capacity */}
        <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <Boxes className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-foreground-heading">Zone Capacity</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            {CAPACITY_ZONES.map((z) => (
              <div key={z.zone}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground-body font-medium truncate pr-2">{z.zone}</span>
                  <span className={`text-xs font-bold ${z.used >= 80 ? "text-status-danger" : z.used >= 60 ? "text-status-warning" : "text-status-success"}`}>
                    {z.used}%
                  </span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${z.color} transition-all`}
                    style={{ width: `${z.used}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl bg-surface-card border border-border p-6">
        <h2 className="font-semibold text-foreground-heading mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-brand" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { href: "/wms/inward", label: "New Inward", icon: PackageOpen },
            { href: "/wms/quality-check", label: "QC Queue", icon: ClipboardCheck },
            { href: "/wms/orders/picking", label: "Start Picking", icon: ShoppingCart },
            { href: "/wms/orders/packing", label: "Pack Orders", icon: Package },
            { href: "/wms/dispatch", label: "Dispatch", icon: Truck },
            { href: "/wms/reports", label: "Reports", icon: TrendingUp },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 hover:bg-secondary-subtle hover:border-border-focus transition-colors text-center"
            >
              <action.icon className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-foreground-body">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
