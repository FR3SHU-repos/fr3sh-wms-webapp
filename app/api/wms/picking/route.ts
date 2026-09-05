import { NextRequest } from "next/server";
import { proxyGoGET, proxyGoMutation } from "@/shared/lib/api/go-proxy";
export function GET(req: NextRequest) { return proxyGoGET(req, "/wms/picks"); }
export function POST(req: NextRequest) { return proxyGoMutation(req, "/wms/picks"); }
export function PATCH(req: NextRequest) { return proxyGoMutation(req, "/wms/picks/" + String(new URL(req.url).searchParams.get("id") ?? "")); }
