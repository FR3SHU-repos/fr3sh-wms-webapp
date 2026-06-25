import { Schema, Document, model, models } from "mongoose";

export interface IPackingTask extends Document {
  packId: string;
  orderId: string;
  pickTaskId?: string;
  customerName?: string;
  deliveryAddress?: string;
  items: Array<{
    product: string;
    skuCode?: string;
    batchId?: string;
    quantity: number;
    unit?: string;
    verified: boolean;
  }>;
  expectedWeightKg?: number;
  actualWeightKg?: number;
  packagingMaterial?: string;
  invoiceUrl?: string;
  shippingLabelUrl?: string;
  status: "Pending Packing" | "Packing" | "Packed" | "Ready for Dispatch" | "Cancelled";
  packedBy?: string;
  packedAt?: Date;
  notes?: string;
  warehouseId: string;
  createdAt: Date;
  updatedAt: Date;
}

const PackingTaskSchema = new Schema<IPackingTask>(
  {
    packId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    pickTaskId: String,
    customerName: String,
    deliveryAddress: String,
    items: [
      {
        product: String,
        skuCode: String,
        batchId: String,
        quantity: Number,
        unit: String,
        verified: { type: Boolean, default: false },
      },
    ],
    expectedWeightKg: Number,
    actualWeightKg: Number,
    packagingMaterial: String,
    invoiceUrl: String,
    shippingLabelUrl: String,
    status: {
      type: String,
      enum: ["Pending Packing", "Packing", "Packed", "Ready for Dispatch", "Cancelled"],
      default: "Pending Packing",
    },
    packedBy: String,
    packedAt: Date,
    notes: String,
    warehouseId: { type: String, default: "main" },
  },
  { timestamps: true },
);

PackingTaskSchema.index({ orderId: 1 });
PackingTaskSchema.index({ status: 1 });

export const PackingTask =
  models.PackingTask ?? model<IPackingTask>("PackingTask", PackingTaskSchema);
