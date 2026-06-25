"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWMSUser } from "@/shared/context/WMSUserContext";
import { cx } from "@/shared/lib/utils";
import {
  LayoutDashboard,
  PackageOpen,
  ClipboardCheck,
  Boxes,
  MapPin,
  Layers,
  ShoppingCart,
  Package,
  Truck,
  RotateCcw,
  SlidersHorizontal,
  BarChart3,
  Settings,
  Menu,
  X,
  Leaf,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  children?: { href: string; label: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/wms/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/wms/inward", label: "Inward", icon: PackageOpen },
  { href: "/wms/quality-check", label: "Quality Check", icon: ClipboardCheck },
  { href: "/wms/inventory", label: "Inventory", icon: Boxes },
  { href: "/wms/locations", label: "Locations", icon: MapPin },
  { href: "/wms/batches", label: "Batches & Expiry", icon: Layers },
  {
    href: "/wms/orders",
    label: "Orders",
    icon: ShoppingCart,
    children: [
      { href: "/wms/orders/picking", label: "Picking" },
      { href: "/wms/orders/packing", label: "Packing" },
    ],
  },
  { href: "/wms/dispatch", label: "Dispatch", icon: Truck },
  { href: "/wms/returns", label: "Returns", icon: RotateCcw },
  { href: "/wms/adjustments", label: "Adjustments", icon: SlidersHorizontal },
  { href: "/wms/reports", label: "Reports", icon: BarChart3 },
  { href: "/wms/settings", label: "Settings", icon: Settings },
];

const ROLE_BADGE_COLORS: Record<string, string> = {
  "Warehouse Admin": "bg-primary text-primary-foreground",
  "Warehouse Manager": "bg-brand text-white",
  "Receiving Staff": "bg-status-info-surface text-status-info",
  "QC Staff": "bg-status-warning-surface text-status-warning",
  Picker: "bg-secondary text-secondary-foreground",
  Packer: "bg-secondary-subtle text-secondary-foreground",
  Dispatcher: "bg-status-success-surface text-status-success",
  "Inventory Auditor": "bg-tertiary text-tertiary-foreground",
  "Finance Viewer": "bg-status-info-surface text-status-info",
  "Super Admin": "bg-primary-hover text-white",
};

function NavLink({
  item,
  onClick,
}: {
  item: NavItem;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() =>
    item.children?.some((c) => pathname.startsWith(c.href)) ?? false,
  );

  const isActive = item.exact
    ? pathname === item.href
    : item.children
      ? item.children.some((c) => pathname.startsWith(c.href))
      : pathname.startsWith(item.href);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cx(
            "flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-xl",
            isActive
              ? "bg-secondary-subtle text-foreground-heading"
              : "text-foreground-muted hover:bg-secondary-subtle",
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {open ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
        {open && (
          <div className="ml-7 mt-0.5 space-y-0.5 border-l border-border pl-3">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClick}
                className={cx(
                  "block px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname.startsWith(child.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground-muted hover:bg-secondary-subtle",
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cx(
        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-xl",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-foreground-muted hover:bg-secondary-subtle",
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useWMSUser();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="flex h-full w-64 flex-col bg-surface-card border-r border-border">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Leaf className="h-5 w-5 text-brand" />
        <div>
          <span className="text-base font-bold text-brand block leading-tight">FR3SH</span>
          <span className="text-xs text-foreground-muted">Warehouse System</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1 text-foreground-muted hover:bg-secondary-subtle lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-hide">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} onClick={onClose} />
        ))}
      </nav>

      <div className="border-t border-border px-4 py-4 space-y-2">
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
              {user.name?.[0]?.toUpperCase() ?? "W"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground-heading">
                {user.name}
              </p>
              <span
                className={cx(
                  "inline-block text-xs px-1.5 py-0.5 rounded-md font-medium",
                  ROLE_BADGE_COLORS[user.role] ?? "bg-tertiary text-tertiary-foreground",
                )}
              >
                {user.role}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground-muted hover:bg-status-danger-surface hover:text-status-danger transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default function WMSSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex">
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-40">
        <Sidebar />
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground-heading/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cx(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar onClose={() => setMobileOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="flex items-center gap-3 border-b border-border bg-surface-card px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-foreground-muted hover:bg-secondary-subtle"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-brand" />
            <span className="text-sm font-bold text-brand">FR3SH WMS</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
