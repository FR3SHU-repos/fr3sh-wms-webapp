import { NextRequest } from "next/server";
import { proxyGoGET, proxyGoMutation } from "@/shared/lib/api/go-proxy";

export async function GET(req: NextRequest) {
  return proxyGoGET(req, "/wms/inward");
}

export async function POST(req: NextRequest) {
  return proxyGoMutation(req, "/wms/inward");
}
