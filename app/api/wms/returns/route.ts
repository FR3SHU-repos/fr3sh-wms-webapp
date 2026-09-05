import { NextRequest } from "next/server";
import { proxyGoGET, proxyGoMutation } from "@/shared/lib/api/go-proxy";
export function GET(req: NextRequest) { return proxyGoGET(req, "/wms/returns"); }
export function POST(req: NextRequest) { return proxyGoMutation(req, "/wms/returns"); }
// migration-audit:new-operation
export function PATCH(req: NextRequest) { return proxyGoMutation(req, "/wms/returns/" + String(new URL(req.url).searchParams.get("id") ?? "")); }
