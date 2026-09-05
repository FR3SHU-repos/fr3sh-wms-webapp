import Link from "next/link";
import { Leaf, Warehouse } from "lucide-react";

// Warehouse staff accounts are provisioned by an administrator (they carry a
// warehouse + role scope that must not be self-assigned). There is no
// self-service warehouse registration.
export default function WMSRegisterPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground-heading mt-3">FR3SH WMS</h1>
          <p className="text-sm text-foreground-muted mt-1 flex items-center gap-1">
            <Warehouse className="h-3.5 w-3.5" /> Warehouse Management System
          </p>
        </div>
        <div className="rounded-2xl bg-surface-card border border-border p-6 shadow-sm">
          <h2 className="text-base font-semibold text-foreground-heading">
            Accounts are invite-only
          </h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Warehouse access is granted by an administrator. Ask your warehouse
            admin to create your account, then sign in with the credentials you
            receive.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-block rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-hover"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
