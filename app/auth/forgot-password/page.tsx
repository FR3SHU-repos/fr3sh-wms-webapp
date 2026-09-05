"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Leaf } from "lucide-react";

import { createAuthBrowserClient } from "@/shared/lib/supabase/auth-client";
import { INPUT_CLS } from "@/shared/components/auth/parts";

const COOLDOWN = 60;

export default function ForgotPasswordPage() {
  const supabase = createAuthBrowserClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || cooldown > 0) return;
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    setSent(true);
    setCooldown(COOLDOWN);
    toast.success("If that email has an account, a reset link is on its way.");
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground-heading mt-3">
            Reset your password
          </h1>
        </div>
        <div className="rounded-2xl bg-surface-card border border-border p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                Email address
              </label>
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:bg-primary-hover disabled:opacity-60"
            >
              {loading
                ? "Sending…"
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Send reset link"}
            </button>
          </form>
          {sent && (
            <p className="mt-4 rounded-lg bg-primary/5 p-3 text-xs text-foreground-body">
              Check your inbox for the reset link.
            </p>
          )}
        </div>
        <p className="text-center text-xs text-foreground-muted mt-6">
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
