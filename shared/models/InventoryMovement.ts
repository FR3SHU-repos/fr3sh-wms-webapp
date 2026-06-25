import { Schema, Document, model, models } from "mongoose";

export interface IInventoryMovement extends Document {
  movementId: string;
  movementType: "inward" | "outward" | "transfer" | "adjustment" | "return" | "damage" | "expiry" | "pick" | "pack" | "dispatch";
  skuCode: string;
  productName: string;
  batchId: string;
  quantity: number;
  unit: string;
  locationFrom?: string;
  locationTo?: string;
  referenceId?: string;
  referenceType?: string;
  notes?: string;
  performedBy: string;
  warehouseId: string;
  createdAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    movementId: { type: String, required: true, unique: true },
    movementType: {
      type: String,
      required: true,
      enum: ["inward", "outward", "transfer", "adjustment", "return", "damage", "expiry", "pick", "pack", "dispatch"],
    },
    skuCode: { type: String, required: true },
    productName: { type: String, required: true },
    batchId: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    locationFrom: String,
    locationTo: String,
    referenceId: String,
    referenceType: String,
    notes: String,
    performedBy: { type: String, required: true },
    warehouseId: { type: String, default: "main" },
  },
  { timestamps: true, versionKey: false },
);

InventoryMovementSchema.index({ batchId: 1 });
InventoryMovementSchema.index({ skuCode: 1 });
InventoryMovementSchema.index({ movementType: 1 });
InventoryMovementSchema.index({ createdAt: -1 });

export const InventoryMovement =
  models.InventoryMovement ??
  model<IInventoryMovement>("InventoryMovement", InventoryMovementSchema);
