import { NextRequest } from "next/server";
import { proxyGoGET, proxyGoMutation } from "@/shared/lib/api/go-proxy";
export function GET(req: NextRequest) { return proxyGoGET(req, "/wms/products"); }
export function POST(req: NextRequest) { return proxyGoMutation(req, "/wms/products"); }
