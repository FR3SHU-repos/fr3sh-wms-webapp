import { Schema, Document, model, models } from "mongoose";

export interface ICycleCount extends Document {
  countId: string;
  zone: string;
  scheduledDate: Date;
  assignedTo?: string;
  items: Array<{
    binId?: string;
    binLabel: string;
    product?: string;
    skuCode?: string;
    batchId?: string;
    systemQty: number;
    physicalQty?: number;
    variance?: number;
    counted: boolean;
    notes?: string;
  }>;
  status: "Scheduled" | "In Progress" | "Completed" | "Pending Approval";
  varianceTotal?: number;
  approvedBy?: string;
  completedAt?: Date;
  warehouseId: string;
  createdAt: Date;
  updatedAt: Date;
}

const CycleCountSchema = new Schema<ICycleCount>(
  {
    countId: { type: String, required: true, unique: true },
    zone: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    assignedTo: String,
    items: [
      {
        binId: String,
        binLabel: { type: String, required: true },
        product: String,
        skuCode: String,
        batchId: String,
        systemQty: { type: Number, default: 0 },
        physicalQty: Number,
        variance: Number,
        counted: { type: Boolean, default: false },
        notes: String,
      },
    ],
    status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Completed", "Pending Approval"],
      default: "Scheduled",
    },
    varianceTotal: Number,
    approvedBy: String,
    completedAt: Date,
    warehouseId: { type: String, default: "main" },
  },
  { timestamps: true },
);

CycleCountSchema.index({ countId: 1 });
CycleCountSchema.index({ zone: 1 });
CycleCountSchema.index({ scheduledDate: 1 });

export const CycleCount =
  models.CycleCount ?? model<ICycleCount>("CycleCount", CycleCountSchema);
