import { NextRequest } from "next/server";
import { proxyGoGET, proxyGoMutation } from "@/shared/lib/api/go-proxy";
// migration-audit:new-route
export function GET(req: NextRequest) { return proxyGoGET(req, "/wms/packs"); }
export function POST(req: NextRequest) { return proxyGoMutation(req, "/wms/packs"); }
export function PATCH(req: NextRequest) { return proxyGoMutation(req, "/wms/packs/" + String(new URL(req.url).searchParams.get("id") ?? "")); }
