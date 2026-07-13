"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Eye, EyeOff, Warehouse } from "lucide-react";
import toast from "react-hot-toast";
import { useWMSUser } from "@/shared/context/WMSUserContext";

const ROLES = [
  "Warehouse Manager",
  "Receiving Staff",
  "QC Staff",
  "Picker",
  "Packer",
  "Dispatcher",
  "Inventory Auditor",
  "Finance Viewer",
];

export default function WMSRegisterPage() {
  const router = useRouter();
  const { login } = useWMSUser();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/wms/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? "Registration failed");
        return;
      }

      login(data.data);
      toast.success(`Welcome, ${data.data.name}`);
      router.replace("/wms/dashboard");
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground-heading mt-2">FR3SH WMS</h1>
          <p className="text-sm text-foreground-muted mt-1 flex items-center gap-1">
            <Warehouse className="h-3.5 w-3.5" /> Warehouse Management System
          </p>
        </div>

        <div className="rounded-2xl bg-surface-card border border-border p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground-heading mb-5">Create your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">Full name</label>
              <input
                type="text"
                required
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus transition-shadow"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@warehouse.com"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus transition-shadow"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">Role</label>
              <select
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus transition-shadow"
              >
                <option value="" disabled>
                  Select your role
                </option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground-body"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">Confirm password</label>
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={8}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-foreground-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
