import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export interface WMSTokenPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  warehouseId: string;
  warehouseCode: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? "fallback-secret-change-in-production";
const COOKIE_NAME = "wms_token";

// Cookie issuance / token signing now lives in go-api-backend (`wmsauth`); the
// login route here is a database-free proxy that relays Go's Set-Cookie. This
// app only *verifies* the `wms_token` cookie for the SSR route guard.

export function verifyWMSToken(token: string): WMSTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as WMSTokenPayload;
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
