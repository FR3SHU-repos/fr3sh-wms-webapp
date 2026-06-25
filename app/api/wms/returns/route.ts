import { NextRequest, NextResponse } from "next/server";
import { mongoDB } from "@/shared/lib/db/mongo";
import { getWMSSession } from "@/shared/lib/auth";
import { Return } from "@/shared/models/Return";
import { InventoryMovement } from "@/shared/models/InventoryMovement";

export async function GET(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const returns = await Return.find({ warehouseId: session.warehouseId }).sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json({ success: true, data: returns });
}

export async function POST(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const body = await req.json();

  const count = await Return.countDocuments();
  const returnId = `RET-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const ret = await Return.create({
    returnId,
    orderId: body.orderId,
    customerName: body.customer,
    productName: body.product,
    skuCode: body.sku,
    batchId: body.batch,
    returnReason: body.reason,
    photos: body.photos ?? [],
    inspectionResult: body.inspectionResult,
    finalAction: body.finalAction ?? "Further Inspection",
    notes: body.notes,
    handledBy: session.id,
    status: "Pending Inspection",
    warehouseId: session.warehouseId,
  });

  const movCount = await InventoryMovement.countDocuments();
  await InventoryMovement.create({
    movementId: `MOV-RET-${Date.now()}-${movCount}`,
    movementType: "return",
    skuCode: body.sku || "UNKNOWN",
    productName: body.product,
    batchId: body.batch || "RETURN",
    quantity: 1,
    unit: "unit",
    locationFrom: "Customer",
    locationTo: "Returns Bay",
    referenceId: returnId,
    referenceType: "Return",
    performedBy: session.id,
    warehouseId: session.warehouseId,
  });

  return NextResponse.json({ success: true, message: "Return registered", data: ret }, { status: 201 });
}
