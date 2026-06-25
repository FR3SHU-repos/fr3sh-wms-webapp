import { Schema, Document, model, models } from "mongoose";

export interface IStockAdjustment extends Document {
  adjustmentId: string;
  productName: string;
  skuCode?: string;
  batchId?: string;
  locationLabel?: string;
  quantityBefore: number;
  quantityAfter: number;
  quantityDiff: number;
  unit: string;
  reason: string;
  notes?: string;
  performedBy: string;
  approvedBy?: string;
  approvalStatus: "Pending" | "Approved" | "Rejected";
  approvalNotes?: string;
  warehouseId: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockAdjustmentSchema = new Schema<IStockAdjustment>(
  {
    adjustmentId: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    skuCode: String,
    batchId: String,
    locationLabel: String,
    quantityBefore: { type: Number, required: true },
    quantityAfter: { type: Number, required: true },
    quantityDiff: { type: Number, required: true },
    unit: { type: String, default: "kg" },
    reason: { type: String, required: true },
    notes: String,
    performedBy: { type: String, required: true },
    approvedBy: String,
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvalNotes: String,
    warehouseId: { type: String, default: "main" },
  },
  { timestamps: true },
);

StockAdjustmentSchema.index({ approvalStatus: 1 });
StockAdjustmentSchema.index({ createdAt: -1 });

export const StockAdjustment =
  models.StockAdjustment ??
  model<IStockAdjustment>("StockAdjustment", StockAdjustmentSchema);
