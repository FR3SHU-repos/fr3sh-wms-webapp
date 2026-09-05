"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Eye, EyeOff, Warehouse } from "lucide-react";
import toast from "react-hot-toast";

type RegOption = {
  type: string;
  label: string;
  group: string;
  requiresApproval: boolean;
  needs?: string[];
};

const INPUT =
  "w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-border-focus transition-shadow";

export default function WMSRegisterPage() {
  const router = useRouter();

  const [options, setOptions] = useState<RegOption[]>([]);
  const [subRoles, setSubRoles] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    type: "",
    warehouseCode: "",
    warehouseSubRole: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  // Registration options come from the backend — the same shared set every
  // FR3SH app uses, filtered to the ones a warehouse operator can pick.
  useEffect(() => {
    fetch("/api/wms/auth/registration-options?app=wms")
      .then((r) => r.json())
      .then((d) => {
        const opts: RegOption[] = d?.data?.options ?? [];
        setOptions(opts);
        setSubRoles(d?.data?.warehouseSubRoles ?? []);
        setForm((f) => ({ ...f, type: f.type || opts[0]?.type || "" }));
      })
      .catch(() => toast.error("Could not load registration options"));
  }, []);

  const selected = options.find((o) => o.type === form.type);
  const needs = (field: string) => selected?.needs?.includes(field) ?? false;

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
          app: "wms",
          name: form.name,
          email: form.email,
          password: form.password,
          type: form.type,
          warehouseCode: needs("warehouseCode") ? form.warehouseCode : undefined,
          warehouseSubRole: needs("warehouseSubRole")
            ? form.warehouseSubRole
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message ?? "Registration failed");
        return;
      }
      if (data.data?.pendingApproval) {
        setDone(
          data.message ??
            "Your account was created and is awaiting admin approval."
        );
        return;
      }
      toast.success("Account created");
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground-heading mt-3">FR3SH WMS</h1>
          <p className="text-sm text-foreground-muted mt-1 flex items-center gap-1">
            <Warehouse className="h-3.5 w-3.5" /> Warehouse Management System
          </p>
        </div>

        <div className="rounded-2xl bg-surface-card border border-border p-6 shadow-sm">
          {done ? (
            <div className="space-y-3 text-center">
              <h2 className="text-base font-semibold text-foreground-heading">
                Account created
              </h2>
              <p className="text-sm text-foreground-muted">{done}</p>
              <Link
                href="/login"
                className="inline-block rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-hover"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-base font-semibold text-foreground-heading mb-5">
                Create your account
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Doe"
                    className={INPUT}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@warehouse.com"
                    className={INPUT}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                    Role
                  </label>
                  <select
                    required
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className={INPUT}
                  >
                    <option value="" disabled>
                      Select your role
                    </option>
                    {options.map((o) => (
                      <option key={o.type} value={o.type}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {needs("warehouseSubRole") && (
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                      Warehouse function
                    </label>
                    <select
                      required
                      value={form.warehouseSubRole}
                      onChange={(e) =>
                        setForm({ ...form, warehouseSubRole: e.target.value })
                      }
                      className={INPUT}
                    >
                      <option value="" disabled>
                        Select a function
                      </option>
                      {subRoles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {needs("warehouseCode") && (
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                      Warehouse code
                    </label>
                    <input
                      type="text"
                      value={form.warehouseCode}
                      onChange={(e) =>
                        setForm({ ...form, warehouseCode: e.target.value })
                      }
                      placeholder="e.g. VIZAG01 (optional — an admin can set this)"
                      className={INPUT}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      minLength={8}
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className={INPUT + " pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground-body"
                    >
                      {showPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                    Confirm password
                  </label>
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    minLength={8}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className={INPUT}
                  />
                </div>

                {selected?.requiresApproval && (
                  <p className="text-xs text-foreground-muted">
                    Warehouse accounts are activated by an administrator after
                    review — you&apos;ll be able to sign in once approved.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </form>
            </>
          )}
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
