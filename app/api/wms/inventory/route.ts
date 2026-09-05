import { NextRequest } from "next/server";
import { proxyGoGET } from "@/shared/lib/api/go-proxy";

export async function GET(request: NextRequest) { return proxyGoGET(request, "/wms/inventory"); }
