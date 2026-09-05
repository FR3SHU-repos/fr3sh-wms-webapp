import { NextRequest } from "next/server";
import { proxyGoGET } from "@/shared/lib/api/go-proxy";

/** Shared registration options for the WMS register form (Go owns the catalogue). */
export function GET(request: NextRequest) {
  return proxyGoGET(request, "/wms/auth/registration-options");
}
