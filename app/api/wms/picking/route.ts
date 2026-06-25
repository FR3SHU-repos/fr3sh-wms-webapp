import { NextRequest, NextResponse } from "next/server";
import { mongoDB } from "@/shared/lib/db/mongo";
import { getWMSSession } from "@/shared/lib/auth";
import { PickTask } from "@/shared/models/PickTask";
import { InventoryBatch } from "@/shared/models/InventoryBatch";
import { InventoryMovement } from "@/shared/models/InventoryMovement";

export async function GET(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const filter: Record<string, unknown> = { warehouseId: session.warehouseId };
  if (status) filter.status = status;

  const tasks = await PickTask.find(filter).sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json({ success: true, data: tasks });
}

export async function POST(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const body = await req.json();

  const count = await PickTask.countDocuments();
  const pickId = `PICK-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const task = await PickTask.create({
    pickId,
    orderId: body.orderId,
    priority: body.priority ?? "Normal",
    customerName: body.customerName,
    items: body.items ?? [],
    status: "Pending Pick",
    warehouseId: session.warehouseId,
  });

  return NextResponse.json({ success: true, message: "Pick task created", data: task }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const body = await req.json();
  const { pickId, status } = body;

  const task = await PickTask.findOneAndUpdate(
    { pickId },
    {
      status,
      ...(status === "Picking" ? { startedAt: new Date(), assignedTo: session.id } : {}),
      ...(status === "Picked" ? { completedAt: new Date() } : {}),
    },
    { new: true },
  );

  if (!task) return NextResponse.json({ success: false, message: "Pick task not found" }, { status: 404 });

  if (status === "Picked") {
    for (const item of task.items) {
      if (item.batchId) {
        await InventoryBatch.findOneAndUpdate(
          { batchId: item.batchId },
          { $inc: { quantityReserved: item.quantity } },
        );
        const movCount = await InventoryMovement.countDocuments();
        await InventoryMovement.create({
          movementId: `MOV-PICK-${Date.now()}-${movCount}`,
          movementType: "pick",
          skuCode: item.skuCode || "UNKNOWN",
          productName: item.product,
          batchId: item.batchId,
          quantity: item.quantity,
          unit: item.unit ?? "kg",
          locationFrom: item.locationLabel,
          locationTo: "Packing Station",
          referenceId: pickId,
          referenceType: "PickTask",
          performedBy: session.id,
        });
      }
    }
  }

  return NextResponse.json({ success: true, data: task });
}
