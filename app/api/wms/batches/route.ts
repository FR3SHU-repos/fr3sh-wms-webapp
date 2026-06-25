import { NextRequest, NextResponse } from "next/server";
import { mongoDB } from "@/shared/lib/db/mongo";
import { getWMSSession } from "@/shared/lib/auth";
import { InventoryBatch } from "@/shared/models/InventoryBatch";

export async function GET(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const sku = searchParams.get("sku");
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 30);

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (sku) filter.skuCode = sku;

  const [batches, total] = await Promise.all([
    InventoryBatch.find(filter).sort({ expiryDate: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    InventoryBatch.countDocuments(filter),
  ]);

  return NextResponse.json({ success: true, data: batches, total });
}
