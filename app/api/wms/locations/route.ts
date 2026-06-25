import { NextRequest, NextResponse } from "next/server";
import { mongoDB } from "@/shared/lib/db/mongo";
import { getWMSSession } from "@/shared/lib/auth";
import { WarehouseLocation } from "@/shared/models/WarehouseLocation";
import { InventoryBatch } from "@/shared/models/InventoryBatch";

export async function GET(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const parentId = searchParams.get("parentId");
  const zoneCode = searchParams.get("zoneCode");
  const withBatches = searchParams.get("withBatches") === "true";

  const filter: Record<string, unknown> = { isActive: true, warehouseId: session.warehouseId };
  if (type) filter.type = type;
  if (parentId) filter.parentId = parentId;
  if (zoneCode) filter.zoneCode = zoneCode;

  const locations = await WarehouseLocation.find(filter).sort({ code: 1 }).lean();

  // Optionally attach live batch counts per zone
  if (withBatches && type === "zone") {
    const batchCounts = await InventoryBatch.aggregate([
      { $match: { status: { $in: ["Active", "Near Expiry"] } } },
      { $group: { _id: "$zoneCode", count: { $sum: 1 }, totalQty: { $sum: "$quantityAvailable" } } },
    ]);
    const batchMap = Object.fromEntries(batchCounts.map((b) => [b._id, { count: b.count, totalQty: b.totalQty }]));

    const enriched = locations.map((loc) => ({
      ...loc,
      batchCount: batchMap[loc.zoneCode ?? ""]?.count ?? 0,
      totalQtyAvailable: batchMap[loc.zoneCode ?? ""]?.totalQty ?? 0,
    }));
    return NextResponse.json({ success: true, data: enriched });
  }

  return NextResponse.json({ success: true, data: locations });
}

export async function POST(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  if (!["Warehouse Admin", "Warehouse Manager", "Super Admin"].includes(session.role)) {
    return NextResponse.json({ success: false, message: "Insufficient permissions" }, { status: 403 });
  }

  await mongoDB();
  const body = await req.json();

  const location = await WarehouseLocation.create({
    type: body.type,
    code: body.code,
    name: body.name,
    parentId: body.parentId || undefined,
    zoneCode: body.zoneCode,
    storageType: body.storageType ?? "Ambient",
    temperatureRange: body.temperatureRange,
    capacityKg: body.capacityKg ? Number(body.capacityKg) : undefined,
    capacityUnits: body.capacityUnits ? Number(body.capacityUnits) : undefined,
    productCategoryMapping: body.productCategoryMapping ?? [],
    warehouseId: session.warehouseId,
  });

  return NextResponse.json({ success: true, message: "Location created", data: location }, { status: 201 });
}
