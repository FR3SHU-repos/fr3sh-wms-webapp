import { NextRequest } from "next/server";
import { proxyGoGET, proxyGoMutation } from "@/shared/lib/api/go-proxy";

/** @deprecated Compatibility route; Go owns warehouse facility metadata. */
export function GET(request: NextRequest) {
  return proxyGoGET(request, "/warehouses");
}
export function POST(request: NextRequest) {
  return proxyGoMutation(request, "/warehouses");
}
export function PATCH(request: NextRequest) {
  return proxyGoMutation(request, "/warehouses");
}
