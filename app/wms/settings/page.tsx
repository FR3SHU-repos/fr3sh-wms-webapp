import { Settings, Users, Warehouse, Bell, Shield, Database } from "lucide-react";

const ROLES = [
  { role: "Super Admin", count: 1, permissions: "Full access" },
  { role: "Warehouse Admin", count: 2, permissions: "Full warehouse access" },
  { role: "Warehouse Manager", count: 3, permissions: "All operations, reports" },
  { role: "Receiving Staff", count: 5, permissions: "Inward, QC" },
  { role: "QC Staff", count: 4, permissions: "Quality Check only" },
  { role: "Picker", count: 8, permissions: "Picking only" },
  { role: "Packer", count: 4, permissions: "Packing only" },
  { role: "Dispatcher", count: 2, permissions: "Dispatch, tracking" },
  { role: "Inventory Auditor", count: 2, permissions: "Inventory, reports, adjustments" },
  { role: "Finance Viewer", count: 2, permissions: "Read-only: reports, costs" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground-heading flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" /> WMS Settings
        </h1>
        <p className="text-sm text-foreground-muted mt-1">Configure warehouse, users, roles, and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warehouse info */}
        <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <Warehouse className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-foreground-heading">Warehouse Profile</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            {[
              { label: "Warehouse Name", value: "FR3SH Godown 1", editable: true },
              { label: "Location", value: "Hyderabad, Telangana", editable: true },
              { label: "Total Capacity (sq ft)", value: "12,000", editable: true },
              { label: "Zones Active", value: "26 (A–Z)", editable: false },
              { label: "Bin Count", value: "620", editable: false },
              { label: "Temperature Zones", value: "Ambient, Cool, Cold, Refrigerated", editable: false },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">{f.label}</span>
                {f.editable ? (
                  <input defaultValue={f.value}
                    className="rounded-xl border border-border bg-surface px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-border-focus" />
                ) : (
                  <span className="text-sm font-medium text-foreground-heading">{f.value}</span>
                )}
              </div>
            ))}
            <button className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover w-full">
              Save Changes
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <Bell className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-foreground-heading">Alert Thresholds</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            {[
              { label: "Low Stock Alert (units below)", value: "20" },
              { label: "Near Expiry Alert (days before)", value: "7" },
              { label: "Overstock Alert (% of capacity)", value: "90" },
              { label: "Dead Stock (no movement, days)", value: "30" },
              { label: "QC Pending Alert (hours)", value: "24" },
              { label: "Dispatch Delay Alert (hours)", value: "4" },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between gap-4">
                <span className="text-sm text-foreground-muted flex-1">{f.label}</span>
                <input defaultValue={f.value} type="number"
                  className="rounded-xl border border-border bg-surface px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-border-focus text-right" />
              </div>
            ))}
            <button className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary-hover w-full">
              Save Thresholds
            </button>
          </div>
        </div>

        {/* User roles */}
        <div className="lg:col-span-2 rounded-2xl bg-surface-card border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand" />
              <h2 className="font-semibold text-foreground-heading">User Roles & Permissions</h2>
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary-hover">
              <Users className="h-3.5 w-3.5" /> Manage Users
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface text-foreground-muted">
                  <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">Active Users</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">Permissions</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ROLES.map((r) => (
                  <tr key={r.role} className="hover:bg-surface transition-colors">
                    <td className="px-6 py-3 font-medium text-foreground-heading">{r.role}</td>
                    <td className="px-4 py-3 text-foreground-body">{r.count}</td>
                    <td className="px-4 py-3 text-foreground-muted">{r.permissions}</td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-primary hover:underline font-medium">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Database info */}
        <div className="rounded-2xl bg-surface-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-foreground-heading">Database Collections</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["warehouses", "warehouse_locations", "warehouse_zones", "warehouse_bins", "inward_entries", "quality_checks", "inventory_items", "inventory_batches", "inventory_movements", "pick_tasks", "packing_tasks", "dispatches", "returns", "stock_adjustments", "cycle_counts", "warehouse_alerts", "warehouse_users", "wms_product_catalog"].map((col) => (
              <div key={col} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2">
                <div className="h-1.5 w-1.5 rounded-full bg-status-success shrink-0" />
                <span className="font-mono text-xs text-foreground-muted">{col}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
