import { NextRequest, NextResponse } from "next/server";
import { mongoDB } from "@/shared/lib/db/mongo";
import { getWMSSession } from "@/shared/lib/auth";
import { QualityCheck } from "@/shared/models/QualityCheck";
import { InwardEntry } from "@/shared/models/InwardEntry";
import { InventoryBatch } from "@/shared/models/InventoryBatch";
import { InventoryMovement } from "@/shared/models/InventoryMovement";

export async function GET(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const { searchParams } = new URL(req.url);

  // Stats mode: return today's accepted/rejected counts
  if (searchParams.get("stats") === "true") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [acceptedToday, rejectedToday, partialToday] = await Promise.all([
      QualityCheck.countDocuments({ result: "Accepted", warehouseId: session.warehouseId, performedAt: { $gte: todayStart } }),
      QualityCheck.countDocuments({ result: "Rejected", warehouseId: session.warehouseId, performedAt: { $gte: todayStart } }),
      QualityCheck.countDocuments({ result: "Partially Accepted", warehouseId: session.warehouseId, performedAt: { $gte: todayStart } }),
    ]);

    return NextResponse.json({ success: true, acceptedToday, rejectedToday, partialToday });
  }

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);

  const [checks, total] = await Promise.all([
    QualityCheck.find({ warehouseId: session.warehouseId }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    QualityCheck.countDocuments({ warehouseId: session.warehouseId }),
  ]);

  return NextResponse.json({ success: true, data: checks, total });
}

export async function POST(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const body = await req.json();

  const count = await QualityCheck.countDocuments({ warehouseId: session.warehouseId });
  const qcId = `QC-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const qc = await QualityCheck.create({
    qcId,
    inwardEntryId: body.inwardId,
    batchId: body.batchId,
    productName: body.productName ?? body.product ?? "Unknown",
    moistureLevel: body.moistureLevel,
    foreignMaterial: body.foreignMaterial ?? "None",
    damagePercentage: Number(body.damagePercentage ?? 0),
    smell: body.smell ?? "Fresh",
    color: body.color ?? "Good",
    sizeGrade: body.sizeGrade ?? "A",
    organicCertVerified: body.organicCertCheck ?? false,
    labTestRequired: body.labTestRequired ?? false,
    acceptedQuantity: Number(body.acceptedQty ?? 0),
    rejectedQuantity: Number(body.rejectedQty ?? 0),
    rejectionReason: body.rejectionReason,
    qcNotes: body.qcNotes,
    photos: body.photos ?? [],
    result: body.result ?? "Accepted",
    warehouseId: session.warehouseId,
    performedBy: session.id,
    performedAt: new Date(),
  });

  const inwardStatus =
    body.result === "Accepted"
      ? "Accepted"
      : body.result === "Partially Accepted"
        ? "Partially Accepted"
        : "Rejected";

  await InwardEntry.findOneAndUpdate(
    { entryId: body.inwardId, warehouseId: session.warehouseId },
    { status: inwardStatus },
  );

  if (body.result !== "Rejected") {
    const inward = await InwardEntry.findOne({ entryId: body.inwardId, warehouseId: session.warehouseId });
    if (inward) {
      const existingBatch = await InventoryBatch.findOne({ batchId: inward.batchId });
      const acceptedQty = Number(body.acceptedQty ?? 0);

      if (!existingBatch) {
        await InventoryBatch.create({
          batchId: inward.batchId,
          farmerName: inward.farmerName,
          farmerId: inward.farmerId,
          productName: inward.productName,
          skuCode: inward.skuCode ?? "UNKNOWN",
          quantityTotal: acceptedQty,
          quantityAvailable: acceptedQty,
          unit: inward.unit,
          harvestDate: inward.harvestDate,
          organicCertNumber: body.organicCert,
          qcResult: body.result,
          inwardEntryId: body.inwardId,
          qcEntryId: qcId,
          status: "Active",
          warehouseId: session.warehouseId,
        });
      }

      const movCount = await InventoryMovement.countDocuments();
      await InventoryMovement.create({
        movementId: `MOV-QC-${Date.now()}-${movCount + 1}`,
        movementType: "inward",
        skuCode: inward.skuCode ?? "UNKNOWN",
        productName: inward.productName,
        batchId: inward.batchId,
        quantity: acceptedQty,
        unit: inward.unit,
        locationFrom: "Receiving Bay",
        locationTo: "QC Cleared",
        referenceId: qcId,
        referenceType: "QualityCheck",
        performedBy: session.id,
        warehouseId: session.warehouseId,
      });
    }
  }

  return NextResponse.json({ success: true, message: "QC submitted", data: qc }, { status: 201 });
}
