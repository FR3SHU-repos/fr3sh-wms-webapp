import { NextRequest } from "next/server";
import { proxyGoGET, proxyGoMutation } from "@/shared/lib/api/go-proxy";

export async function GET(request: NextRequest) { return proxyGoGET(request, "/wms/adjustments"); }
export async function POST(request: NextRequest) { return proxyGoMutation(request, "/wms/adjustments"); }
