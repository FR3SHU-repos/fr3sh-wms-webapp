import { Schema, Document, model, models } from "mongoose";

export interface IInwardEntry extends Document {
  entryId: string;
  farmerId?: string;
  farmerName: string;
  supplierType: string;
  productName: string;
  skuCode?: string;
  quantityReceived: number;
  unit: string;
  batchId: string;
  harvestDate?: Date;
  receivedDate: Date;
  expectedShelfLifeDays?: number;
  transportCondition: string;
  purchasePrice?: number;
  invoiceUrl?: string;
  challanUrl?: string;
  photos: string[];
  notes?: string;
  status: "QC Pending" | "Accepted" | "Partially Accepted" | "Rejected" | "Putaway";
  receivedBy: string;
  warehouseId: string;
  createdAt: Date;
  updatedAt: Date;
}

const InwardEntrySchema = new Schema<IInwardEntry>(
  {
    entryId: { type: String, required: true, unique: true },
    farmerId: String,
    farmerName: { type: String, required: true },
    supplierType: { type: String, default: "Farmer/FPO" },
    productName: { type: String, required: true },
    skuCode: String,
    quantityReceived: { type: Number, required: true },
    unit: { type: String, required: true },
    batchId: { type: String, required: true },
    harvestDate: Date,
    receivedDate: { type: Date, default: Date.now },
    expectedShelfLifeDays: Number,
    transportCondition: { type: String, default: "Good" },
    purchasePrice: Number,
    invoiceUrl: String,
    challanUrl: String,
    photos: [String],
    notes: String,
    status: {
      type: String,
      enum: ["QC Pending", "Accepted", "Partially Accepted", "Rejected", "Putaway"],
      default: "QC Pending",
    },
    receivedBy: { type: String, required: true },
    warehouseId: { type: String, default: "main" },
  },
  { timestamps: true },
);

InwardEntrySchema.index({ batchId: 1 });
InwardEntrySchema.index({ status: 1 });
InwardEntrySchema.index({ receivedDate: -1 });

export const InwardEntry =
  models.InwardEntry ?? model<IInwardEntry>("InwardEntry", InwardEntrySchema);
