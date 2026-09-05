import { NextRequest } from "next/server";
import { proxyGoGET } from "@/shared/lib/api/go-proxy";
export function GET(req: NextRequest) { return proxyGoGET(req, "/wms/dashboard"); }
