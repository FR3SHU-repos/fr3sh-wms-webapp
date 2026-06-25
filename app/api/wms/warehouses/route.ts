import { NextRequest, NextResponse } from "next/server";
import { mongoDB } from "@/shared/lib/db/mongo";
import { getWMSSession } from "@/shared/lib/auth";
import { Warehouse } from "@/shared/models/Warehouse";
import { WarehouseUser } from "@/shared/models/WarehouseUser";

export async function GET() {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();

  // Super Admin sees all warehouses; everyone else sees only their own
  let warehouses;
  if (session.role === "Super Admin") {
    warehouses = await Warehouse.find({ isActive: true }).sort({ createdAt: 1 }).lean();
  } else {
    warehouses = await Warehouse.find({ warehouseCode: session.warehouseId, isActive: true }).lean();
  }

  // Attach user counts
  const codes = (warehouses as Array<{ warehouseCode: string }>).map((w) => w.warehouseCode);
  const userCounts = await WarehouseUser.aggregate([
    { $match: { warehouseId: { $in: codes }, isActive: true } },
    { $group: { _id: "$warehouseId", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(userCounts.map((u) => [u._id, u.count]));

  const enriched = (warehouses as Array<Record<string, unknown>>).map((w) => ({
    ...w,
    userCount: countMap[(w.warehouseCode as string)] ?? 0,
  }));

  return NextResponse.json({ success: true, data: enriched });
}

export async function POST(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  if (session.role !== "Super Admin") {
    return NextResponse.json({ success: false, message: "Only Super Admins can create warehouses" }, { status: 403 });
  }

  await mongoDB();
  const body = await req.json();

  if (!body.name || !body.city || !body.state || !body.contactPerson || !body.phone || !body.email) {
    return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
  }

  const warehouse = await Warehouse.create({
    name: body.name,
    address: body.address ?? "",
    city: body.city,
    state: body.state,
    pinCode: body.pinCode ?? "",
    contactPerson: body.contactPerson,
    phone: body.phone,
    email: body.email,
    totalZones: Number(body.totalZones ?? 26),
    totalCapacityKg: Number(body.totalCapacityKg ?? 0),
    status: body.status ?? "Active",
  });

  return NextResponse.json({ success: true, message: "Warehouse created", data: warehouse }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  if (session.role !== "Super Admin") {
    return NextResponse.json({ success: false, message: "Only Super Admins can update warehouses" }, { status: 403 });
  }

  await mongoDB();
  const body = await req.json();
  const { warehouseCode, ...updates } = body;

  if (!warehouseCode) {
    return NextResponse.json({ success: false, message: "warehouseCode required" }, { status: 400 });
  }

  const warehouse = await Warehouse.findOneAndUpdate(
    { warehouseCode },
    { $set: updates },
    { new: true },
  );

  if (!warehouse) return NextResponse.json({ success: false, message: "Warehouse not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: warehouse });
}
