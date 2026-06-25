import { Schema, Document, model, models } from "mongoose";

export interface IDispatch extends Document {
  dispatchId: string;
  orderId: string;
  packTaskId?: string;
  customerName?: string;
  deliveryAddress?: string;
  courierPartner: string;
  riderId?: string;
  awbNumber?: string;
  trackingUrl?: string;
  manifestId?: string;
  dispatchedAt?: Date;
  estimatedDeliveryAt?: Date;
  deliveredAt?: Date;
  status: "Ready for Dispatch" | "Dispatched" | "In Transit" | "Out for Delivery" | "Delivered" | "Failed" | "Returned";
  deliveryZone?: string;
  notes?: string;
  warehouseId: string;
  createdAt: Date;
  updatedAt: Date;
}

const DispatchSchema = new Schema<IDispatch>(
  {
    dispatchId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    packTaskId: String,
    customerName: String,
    deliveryAddress: String,
    courierPartner: { type: String, default: "Dunzo" },
    riderId: String,
    awbNumber: String,
    trackingUrl: String,
    manifestId: String,
    dispatchedAt: Date,
    estimatedDeliveryAt: Date,
    deliveredAt: Date,
    status: {
      type: String,
      enum: ["Ready for Dispatch", "Dispatched", "In Transit", "Out for Delivery", "Delivered", "Failed", "Returned"],
      default: "Ready for Dispatch",
    },
    deliveryZone: String,
    notes: String,
    warehouseId: { type: String, default: "main" },
  },
  { timestamps: true },
);

DispatchSchema.index({ orderId: 1 });
DispatchSchema.index({ status: 1 });

export const Dispatch =
  models.Dispatch ?? model<IDispatch>("Dispatch", DispatchSchema);
