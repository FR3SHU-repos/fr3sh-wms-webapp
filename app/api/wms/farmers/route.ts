import { NextRequest } from "next/server";
import { proxyGoGET, proxyGoMutation } from "@/shared/lib/api/go-proxy";

/** @deprecated Compatibility URL; Go owns the authenticated WMS supplier directory. */
export function GET(request: NextRequest) {
  return proxyGoGET(request, "/wms/suppliers");
}

export function POST(request: NextRequest) {
  return proxyGoMutation(request, "/wms/suppliers");
}
