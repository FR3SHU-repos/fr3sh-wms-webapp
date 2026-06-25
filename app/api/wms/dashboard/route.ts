import { NextResponse } from "next/server";
import { mongoDB } from "@/shared/lib/db/mongo";
import { getWMSSession } from "@/shared/lib/auth";
import { InwardEntry } from "@/shared/models/InwardEntry";
import { InventoryBatch } from "@/shared/models/InventoryBatch";
import { PickTask } from "@/shared/models/PickTask";
import { PackingTask } from "@/shared/models/PackingTask";
import { Dispatch } from "@/shared/models/Dispatch";
import { WarehouseAlert } from "@/shared/models/WarehouseAlert";

export async function GET() {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todayInbound,
    pendingQC,
    ordersTopick,
    ordersToPack,
    lowStockAlerts,
    nearExpiryBatches,
    damagedBatches,
    dispatchPending,
    unreadAlerts,
  ] = await Promise.all([
    InwardEntry.countDocuments({ receivedDate: { $gte: today } }),
    InwardEntry.countDocuments({ status: "QC Pending" }),
    PickTask.countDocuments({ status: { $in: ["Pending Pick", "Picking"] } }),
    PackingTask.countDocuments({ status: { $in: ["Pending Packing", "Packing"] } }),
    WarehouseAlert.countDocuments({ type: "low_stock", isResolved: false }),
    InventoryBatch.countDocuments({
      status: { $in: ["Active", "Near Expiry"] },
      expiryDate: {
        $gte: today,
        $lte: new Date(Date.now() + 7 * 86400000),
      },
    }),
    InventoryBatch.find({ quantityDamaged: { $gt: 0 } }).countDocuments(),
    Dispatch.countDocuments({ status: "Ready for Dispatch" }),
    WarehouseAlert.countDocuments({ isRead: false, isResolved: false }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      todayInbound,
      pendingQC,
      ordersTopick,
      ordersToPack,
      lowStockAlerts,
      nearExpiryBatches,
      damagedBatches,
      dispatchPending,
      unreadAlerts,
    },
  });
}
