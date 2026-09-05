"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Leaf } from "lucide-react";

import { createAuthBrowserClient } from "@/shared/lib/supabase/auth-client";
import { ginFetch } from "@/shared/lib/auth/gin";
import {
  PasswordField,
  StrengthMeter,
  passwordScore,
} from "@/shared/components/auth/parts";

function ResetInner() {
  const router = useRouter();
  const supabase = createAuthBrowserClient();
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setValid(true);
      }
      setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValid(true);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (passwordScore(password).score < 1) {
      toast.error("Choose a stronger password.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setSaving(false);
      toast.error("This reset link is invalid or has expired.");
      return;
    }
    await ginFetch("/account/security/audit", {
      method: "POST",
      body: JSON.stringify({ event: "password_changed" }),
    }).catch(() => {});
    await supabase.auth.signOut();
    toast.success("Password updated. Please sign in.");
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground-heading mt-3">
            Set a new password
          </h1>
        </div>
        <div className="rounded-2xl bg-surface-card border border-border p-6 shadow-sm">
          {!ready ? (
            <p className="text-sm text-foreground-muted">Checking your link…</p>
          ) : !valid ? (
            <div>
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                This reset link is invalid or expired.
              </p>
              <button
                type="button"
                onClick={() => router.replace("/auth/forgot-password")}
                className="mt-4 w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium"
              >
                Request a new link
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <PasswordField
                  label="New password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  minLength={8}
                />
                <StrengthMeter password={password} />
              </div>
              <PasswordField
                label="Confirm new password"
                value={confirm}
                onChange={setConfirm}
                autoComplete="new-password"
                minLength={8}
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetInner />
    </Suspense>
  );
}
