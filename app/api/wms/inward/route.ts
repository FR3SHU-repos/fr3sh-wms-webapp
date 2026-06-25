import { NextRequest, NextResponse } from "next/server";
import { mongoDB } from "@/shared/lib/db/mongo";
import { getWMSSession } from "@/shared/lib/auth";
import { InwardEntry } from "@/shared/models/InwardEntry";
import { InventoryMovement } from "@/shared/models/InventoryMovement";
import { generateBatchId } from "@/shared/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);

  const filter: Record<string, unknown> = { warehouseId: session.warehouseId };
  if (status) filter.status = status;

  const [entries, total] = await Promise.all([
    InwardEntry.find(filter).sort({ receivedDate: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    InwardEntry.countDocuments(filter),
  ]);

  return NextResponse.json({ success: true, data: entries, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const body = await req.json();

  // Auto-generate SKU from skuBase if SKU not manually provided
  let resolvedSku: string = body.sku || "";
  if (!resolvedSku && body.skuBase) {
    const skuBase: string = body.skuBase;
    const escapedBase = skuBase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await InwardEntry.countDocuments({
      warehouseId: session.warehouseId,
      skuCode: { $regex: `^${escapedBase}` },
    });
    resolvedSku = `${skuBase}${String(existing + 1).padStart(4, "0")}`;
  }

  const count = await InwardEntry.countDocuments();
  const entryId = `INW-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const zoneCode = resolvedSku?.split("-")[1] ?? "X";
  const batchId = generateBatchId(zoneCode);

  const entry = await InwardEntry.create({
    entryId,
    farmerId: body.farmerId || undefined,
    farmerName: body.farmer,
    productName: body.product,
    skuCode: resolvedSku || undefined,
    quantityReceived: Number(body.qty),
    unit: body.unit ?? "kg",
    batchId,
    harvestDate: body.harvestDate ? new Date(body.harvestDate) : undefined,
    receivedDate: new Date(),
    expectedShelfLifeDays: body.expectedShelfLife ? Number(body.expectedShelfLife) : undefined,
    transportCondition: body.transportCondition ?? "Good",
    purchasePrice: body.purchasePrice ? Number(body.purchasePrice) : undefined,
    notes: body.notes,
    status: "QC Pending",
    receivedBy: session.id,
    warehouseId: session.warehouseId,
  });

  const movementCount = await InventoryMovement.countDocuments();
  await InventoryMovement.create({
    movementId: `MOV-${Date.now()}-${movementCount + 1}`,
    movementType: "inward",
    skuCode: resolvedSku || "UNKNOWN",
    productName: body.product,
    batchId: entry.batchId,
    quantity: Number(body.qty),
    unit: body.unit ?? "kg",
    locationTo: "Receiving Bay",
    referenceId: entryId,
    referenceType: "InwardEntry",
    notes: "Stock received from supplier",
    performedBy: session.id,
    warehouseId: session.warehouseId,
  });

  return NextResponse.json({ success: true, message: "Inward entry created", data: entry }, { status: 201 });
}
