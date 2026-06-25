import { Schema, Document, model, models } from "mongoose";

const PickItemSchema = new Schema(
  {
    product: { type: String, required: true },
    skuCode: String,
    batchId: String,
    quantity: { type: Number, required: true },
    unit: String,
    locationLabel: String,
    locationId: String,
    picked: { type: Boolean, default: false },
    pickedQuantity: { type: Number, default: 0 },
  },
  { _id: false },
);

export interface IPickTask extends Document {
  pickId: string;
  orderId: string;
  priority: "High" | "Normal" | "Low";
  customerName?: string;
  items: Array<{
    product: string;
    skuCode?: string;
    batchId?: string;
    quantity: number;
    unit?: string;
    locationLabel?: string;
    locationId?: string;
    picked: boolean;
    pickedQuantity: number;
  }>;
  status: "Pending Pick" | "Picking" | "Picked" | "Sent to Packing" | "Cancelled";
  assignedTo?: string;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  warehouseId: string;
  createdAt: Date;
  updatedAt: Date;
}

const PickTaskSchema = new Schema<IPickTask>(
  {
    pickId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    priority: { type: String, enum: ["High", "Normal", "Low"], default: "Normal" },
    customerName: String,
    items: [PickItemSchema],
    status: {
      type: String,
      enum: ["Pending Pick", "Picking", "Picked", "Sent to Packing", "Cancelled"],
      default: "Pending Pick",
    },
    assignedTo: String,
    startedAt: Date,
    completedAt: Date,
    notes: String,
    warehouseId: { type: String, default: "main" },
  },
  { timestamps: true },
);

PickTaskSchema.index({ orderId: 1 });
PickTaskSchema.index({ status: 1 });

export const PickTask =
  models.PickTask ?? model<IPickTask>("PickTask", PickTaskSchema);
