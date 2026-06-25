import { Schema, Document, model, models } from "mongoose";

export interface IReturn extends Document {
  returnId: string;
  orderId: string;
  customerName?: string;
  productName: string;
  skuCode?: string;
  batchId?: string;
  returnReason: string;
  photos: string[];
  inspectionResult?: string;
  finalAction: "Restock" | "Mark as Damaged" | "Dispose" | "Farmer Claim" | "Further Inspection";
  refundStatus?: string;
  replacementOrderId?: string;
  status: "Pending Inspection" | "Inspected" | "Restocked" | "Disposed" | "Farmer Claimed" | "Completed";
  handledBy?: string;
  notes?: string;
  warehouseId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnSchema = new Schema<IReturn>(
  {
    returnId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    customerName: String,
    productName: { type: String, required: true },
    skuCode: String,
    batchId: String,
    returnReason: { type: String, required: true },
    photos: [String],
    inspectionResult: String,
    finalAction: {
      type: String,
      enum: ["Restock", "Mark as Damaged", "Dispose", "Farmer Claim", "Further Inspection"],
      default: "Further Inspection",
    },
    refundStatus: String,
    replacementOrderId: String,
    status: {
      type: String,
      enum: ["Pending Inspection", "Inspected", "Restocked", "Disposed", "Farmer Claimed", "Completed"],
      default: "Pending Inspection",
    },
    handledBy: String,
    notes: String,
    warehouseId: { type: String, default: "main" },
  },
  { timestamps: true },
);

ReturnSchema.index({ orderId: 1 });
ReturnSchema.index({ status: 1 });

export const Return =
  models.Return ?? model<IReturn>("Return", ReturnSchema);
