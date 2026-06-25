import { NextRequest, NextResponse } from "next/server";
import { mongoDB } from "@/shared/lib/db/mongo";
import { getWMSSession } from "@/shared/lib/auth";
import { WarehouseLocation } from "@/shared/models/WarehouseLocation";

export async function GET(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const filter: Record<string, unknown> = { isActive: true };
  if (type) filter.type = type;

  const locations = await WarehouseLocation.find(filter).sort({ code: 1 }).lean();
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
    parentId: body.parentId,
    zoneCode: body.zoneCode,
    storageType: body.storageType ?? "Ambient",
    temperatureRange: body.temperatureRange,
    capacityKg: body.capacityKg,
    capacityUnits: body.capacityUnits,
    productCategoryMapping: body.productCategoryMapping ?? [],
    warehouseId: "main",
  });

  return NextResponse.json({ success: true, message: "Location created", data: location }, { status: 201 });
}
