import { NextRequest, NextResponse } from "next/server";
import { mongoDB } from "@/shared/lib/db/mongo";
import { getWMSSession } from "@/shared/lib/auth";
import { Farmer } from "@/shared/models/Farmer";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const nameFilter = q ? { name: { $regex: q, $options: "i" } } : {};

  // Query existing farmers-republic farmers collection (field: active, profileId)
  const existingFarmers = await mongoose.connection
    .collection("farmers")
    .find({ active: true, name: { $exists: true, $ne: "" }, ...nameFilter })
    .project({ profileId: 1, name: 1, state: 1, phone: 1, organicCertified: 1 })
    .sort({ name: 1 })
    .limit(80)
    .toArray();

  // Query WMS-registered suppliers (wms_suppliers collection)
  const wmsFilter: Record<string, unknown> = { isActive: true, warehouseId: session.warehouseId };
  if (q) wmsFilter.name = { $regex: q, $options: "i" };
  const wmsSuppliers = await Farmer.find(wmsFilter)
    .select("farmerId name type state location organicCertNumber phone")
    .sort({ name: 1 })
    .limit(50)
    .lean();

  // Normalize into a unified shape for the dropdown
  const fromFarmers = existingFarmers.map((f) => ({
    farmerId: f.profileId ?? f._id.toString(),
    name: f.name as string,
    type: "Individual Farmer",
    state: (f.state as string) ?? "",
    organicCertNumber: f.organicCertified ? "Certified" : undefined,
    phone: f.phone as string | undefined,
    source: "farmers-republic",
  }));

  const fromWMS = wmsSuppliers.map((f) => ({
    farmerId: f.farmerId,
    name: f.name,
    type: f.type,
    state: f.state ?? "",
    organicCertNumber: f.organicCertNumber,
    phone: f.phone,
    source: "wms",
  }));

  // Merge, dedupe by name (WMS entries take precedence)
  const seen = new Set<string>();
  const merged = [...fromWMS, ...fromFarmers].filter((f) => {
    const key = f.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({ success: true, data: merged });
}

export async function POST(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const allowedRoles = ["Super Admin", "Warehouse Admin", "Warehouse Manager", "Receiving Staff"];
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ success: false, message: "Insufficient permissions" }, { status: 403 });
  }

  await mongoDB();
  const body = await req.json();

  const count = await Farmer.countDocuments();
  const farmerId = `FRM-${String(count + 1).padStart(4, "0")}`;

  const farmer = await Farmer.create({
    farmerId,
    name: body.name,
    phone: body.phone,
    email: body.email,
    location: body.location,
    state: body.state,
    type: body.type ?? "Individual Farmer",
    organicCertNumber: body.organicCertNumber,
    certExpiryDate: body.certExpiryDate ? new Date(body.certExpiryDate) : undefined,
    notes: body.notes,
    warehouseId: session.warehouseId,
  });

  return NextResponse.json({ success: true, message: "Supplier registered", data: farmer }, { status: 201 });
}
