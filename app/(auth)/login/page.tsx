"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Leaf, Warehouse } from "lucide-react";

import { createAuthBrowserClient } from "@/shared/lib/supabase/auth-client";
import { bridgeLogin, reconcileIdentity, safeNext } from "@/shared/lib/auth/gin";
import {
  Divider,
  GoogleButton,
  INPUT_CLS,
  PasswordField,
  WhatsAppButton,
} from "@/shared/components/auth/parts";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const supabase = createAuthBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const normEmail = email.trim().toLowerCase();

    let { error } = await supabase.auth.signInWithPassword({
      email: normEmail,
      password,
    });
    if (error && /invalid login credentials/i.test(error.message)) {
      const { migrated } = await bridgeLogin(normEmail, password);
      if (migrated) {
        ({ error } = await supabase.auth.signInWithPassword({
          email: normEmail,
          password,
        }));
      }
    }
    setLoading(false);

    if (error) {
      toast.error(
        /email not confirmed/i.test(error.message)
          ? "Please verify your email first."
          : "Invalid email or password.",
      );
      return;
    }
    await reconcileIdentity();
    router.replace(next);
  }

  async function onGoogle() {
    setGoogleLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setGoogleLoading(false);
      toast.error("Google sign-in is unavailable right now.");
    }
  }

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

        <div className="rounded-2xl bg-surface-card border border-border p-6 shadow-sm space-y-3">
          {params.get("error") === "oauth_denied" && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              Google sign-in was cancelled.
            </p>
          )}
          <GoogleButton onClick={onGoogle} loading={googleLoading} />
          <Divider />
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
            <PasswordField label="Password" value={password} onChange={setPassword} />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:bg-primary-hover disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <Link
            href="/auth/forgot-password"
            className="block text-center text-xs font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
          <WhatsAppButton />
        </div>

        <p className="text-center text-xs text-foreground-muted mt-6">
          Need an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Contact your administrator
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
