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
const COOKIE_MAX_AGE = Number(process.env.JWT_COOKIE_MAX_AGE ?? 28800);

export function signWMSToken(payload: WMSTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ?? "8h",
  });
}

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

export function makeWMSCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };
}
