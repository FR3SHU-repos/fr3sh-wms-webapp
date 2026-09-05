import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// One FR3SH session token, shared by every app. WMS only *verifies* it (for the
// SSR route guard) — issuance lives in go-api-backend. A WMS session is a
// `token` cookie whose `type` / `roles` identify a warehouse identity.
export interface WMSTokenPayload {
  sub: string;
  id: string;
  email: string;
  name: string;
  type: string;
  roles?: string[];
  role?: string;
  warehouseId: string;
  warehouseCode: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? "fallback-secret-change-in-production";
const COOKIE_NAME = "token";

const WAREHOUSE_TYPES = new Set([
  "WarehouseManager",
  "WarehouseStaff",
  "Super Admin",
  "Warehouse Admin",
]);
const WAREHOUSE_ROLES = new Set([
  "Warehouse Manager",
  "Receiving Staff",
  "QC Staff",
  "Picker",
  "Packer",
  "Dispatcher",
  "Inventory Auditor",
  "Finance Viewer",
]);

function isWarehouseIdentity(p: {
  type?: string;
  roles?: string[];
  role?: string;
}): boolean {
  if (p.type && WAREHOUSE_TYPES.has(p.type)) return true;
  if (p.role && WAREHOUSE_ROLES.has(p.role)) return true;
  return (p.roles ?? []).some((r) => WAREHOUSE_ROLES.has(r) || WAREHOUSE_TYPES.has(r));
}

export function verifyWMSToken(token: string): WMSTokenPayload | null {
  try {
    const raw = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    const p = {
      sub: String(raw.sub ?? ""),
      id: String(raw.sub ?? raw.id ?? ""),
      email: String(raw.email ?? ""),
      name: String(raw.name ?? ""),
      type: String(raw.type ?? ""),
      roles: (raw.roles as string[]) ?? undefined,
      role: raw.role ? String(raw.role) : undefined,
      warehouseId: String(raw.warehouseId ?? ""),
      warehouseCode: String(raw.warehouseCode ?? raw.warehouseId ?? ""),
    };
    if (!p.sub || !isWarehouseIdentity(p)) return null;
    return p;
  } catch {
    return null;
  }
}

export async function getWMSSession(): Promise<WMSTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyWMSToken(token);
}
