import { NextRequest } from "next/server";
import { proxyGoGET, proxyGoMutation } from "@/shared/lib/api/go-proxy";

/** @deprecated Compatibility route; Go owns warehouse location hierarchy. */
export function GET(request: NextRequest) {
  return proxyGoGET(request, "/wms/locations");
}
export function POST(request: NextRequest) {
  return proxyGoMutation(request, "/wms/locations");
}
