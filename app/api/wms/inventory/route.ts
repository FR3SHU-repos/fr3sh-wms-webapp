import { NextRequest, NextResponse } from "next/server";
import { mongoDB } from "@/shared/lib/db/mongo";
import { getWMSSession } from "@/shared/lib/auth";
import { InventoryItem } from "@/shared/models/InventoryItem";
import { InventoryBatch } from "@/shared/models/InventoryBatch";

export async function GET(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 50);

  const filter: Record<string, unknown> = { warehouseId: session.warehouseId };
  if (category) filter.category = category;

  const [items, batches, total] = await Promise.all([
    InventoryItem.find(filter).skip((page - 1) * limit).limit(limit).lean(),
    InventoryBatch.find({ warehouseId: session.warehouseId, status: { $in: ["Active", "Near Expiry"] } })
      .sort({ expiryDate: 1 })
      .lean(),
    InventoryItem.countDocuments(filter),
  ]);

  return NextResponse.json({ success: true, data: { items, batches }, total });
}
