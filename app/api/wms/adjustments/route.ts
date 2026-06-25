import { NextRequest, NextResponse } from "next/server";
import { mongoDB } from "@/shared/lib/db/mongo";
import { getWMSSession } from "@/shared/lib/auth";
import { StockAdjustment } from "@/shared/models/StockAdjustment";
import { InventoryBatch } from "@/shared/models/InventoryBatch";
import { InventoryMovement } from "@/shared/models/InventoryMovement";

export async function GET(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const adjustments = await StockAdjustment.find().sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json({ success: true, data: adjustments });
}

export async function POST(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const allowedRoles = ["Super Admin", "Warehouse Admin", "Warehouse Manager", "Inventory Auditor"];
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ success: false, message: "Insufficient permissions for stock adjustment" }, { status: 403 });
  }

  await mongoDB();
  const body = await req.json();

  const before = Number(body.currentQty);
  const after = Number(body.newQty);
  const diff = after - before;

  const count = await StockAdjustment.countDocuments();
  const adjustmentId = `ADJ-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const highValueThreshold = Math.abs(diff) > 50;

  const adj = await StockAdjustment.create({
    adjustmentId,
    productName: body.product,
    skuCode: body.sku,
    batchId: body.batch,
    locationLabel: body.location,
    quantityBefore: before,
    quantityAfter: after,
    quantityDiff: diff,
    unit: body.unit ?? "kg",
    reason: body.reason,
    notes: body.notes,
    performedBy: session.id,
    approvalStatus: highValueThreshold ? "Pending" : "Approved",
  });

  if (!highValueThreshold && body.batch) {
    await InventoryBatch.findOneAndUpdate(
      { batchId: body.batch },
      { $inc: { quantityAvailable: diff } },
    );

    const movCount = await InventoryMovement.countDocuments();
    await InventoryMovement.create({
      movementId: `MOV-ADJ-${Date.now()}-${movCount}`,
      movementType: "adjustment",
      skuCode: body.sku || "UNKNOWN",
      productName: body.product,
      batchId: body.batch || "UNKNOWN",
      quantity: Math.abs(diff),
      unit: body.unit ?? "kg",
      referenceId: adjustmentId,
      referenceType: "StockAdjustment",
      notes: `${body.reason}: ${body.notes ?? ""}`,
      performedBy: session.id,
    });
  }

  return NextResponse.json({ success: true, message: "Adjustment submitted", data: adj }, { status: 201 });
}
