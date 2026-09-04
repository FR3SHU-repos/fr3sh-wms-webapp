import { NextRequest } from "next/server";
import { proxyGoMutation } from "@/shared/lib/api/go-proxy";

/** @deprecated Compatibility route; Go owns WMS staff authentication. */
export function POST(request: NextRequest) {
  return proxyGoMutation(request, "/wms/auth/login");
}
