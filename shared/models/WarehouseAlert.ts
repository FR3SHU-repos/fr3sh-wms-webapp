import { Schema, Document, model, models } from "mongoose";

export interface IWarehouseAlert extends Document {
  alertId: string;
  type: "low_stock" | "near_expiry" | "overstock" | "dead_stock" | "qc_pending" | "dispatch_delay" | "reorder" | "damage" | "stock_reserved_unpacked";
  severity: "Low" | "Medium" | "High" | "Critical";
  title: string;
  message: string;
  skuCode?: string;
  batchId?: string;
  productName?: string;
  currentValue?: number;
  threshold?: number;
  isRead: boolean;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  warehouseId: string;
  createdAt: Date;
}

const WarehouseAlertSchema = new Schema<IWarehouseAlert>(
  {
    alertId: { type: String, required: true, unique: true },
    type: {
      type: String,
      required: true,
      enum: ["low_stock", "near_expiry", "overstock", "dead_stock", "qc_pending", "dispatch_delay", "reorder", "damage", "stock_reserved_unpacked"],
    },
    severity: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    skuCode: String,
    batchId: String,
    productName: String,
    currentValue: Number,
    threshold: Number,
    isRead: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false },
    resolvedBy: String,
    resolvedAt: Date,
    warehouseId: { type: String, default: "main" },
  },
  { timestamps: true, versionKey: false },
);

WarehouseAlertSchema.index({ type: 1 });
WarehouseAlertSchema.index({ isResolved: 1 });
WarehouseAlertSchema.index({ severity: 1 });

export const WarehouseAlert =
  models.WarehouseAlert ??
  model<IWarehouseAlert>("WarehouseAlert", WarehouseAlertSchema);
