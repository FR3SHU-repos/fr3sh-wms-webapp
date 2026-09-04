import { NextRequest } from "next/server";
import { proxyGoGET } from "@/shared/lib/api/go-proxy";

/** @deprecated Compatibility route; Go owns WMS staff authentication. */
export function GET(request: NextRequest) {
  return proxyGoGET(request, "/wms/auth/me");
}
