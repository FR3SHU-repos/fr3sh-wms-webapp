import { Schema, Document, model, models } from "mongoose";

export interface IQualityCheck extends Document {
  qcId: string;
  inwardEntryId: string;
  batchId: string;
  productName: string;
  warehouseId: string;
  moistureLevel?: string;
  foreignMaterial: string;
  damagePercentage: number;
  smell: string;
  color: string;
  sizeGrade: string;
  organicCertVerified: boolean;
  labTestRequired: boolean;
  labTestResult?: string;
  acceptedQuantity: number;
  rejectedQuantity: number;
  rejectionReason?: string;
  qcNotes?: string;
  photos: string[];
  result: "Accepted" | "Partially Accepted" | "Rejected" | "Lab Test Pending";
  performedBy: string;
  performedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QualityCheckSchema = new Schema<IQualityCheck>(
  {
    qcId: { type: String, required: true, unique: true },
    inwardEntryId: { type: String, required: true },
    batchId: { type: String, required: true },
    productName: { type: String, required: true },
    moistureLevel: String,
    foreignMaterial: { type: String, default: "None" },
    damagePercentage: { type: Number, default: 0 },
    smell: { type: String, default: "Fresh" },
    color: { type: String, default: "Good" },
    sizeGrade: { type: String, default: "A" },
    organicCertVerified: { type: Boolean, default: false },
    labTestRequired: { type: Boolean, default: false },
    labTestResult: String,
    acceptedQuantity: { type: Number, required: true },
    rejectedQuantity: { type: Number, default: 0 },
    rejectionReason: String,
    qcNotes: String,
    photos: [String],
    result: {
      type: String,
      enum: ["Accepted", "Partially Accepted", "Rejected", "Lab Test Pending"],
      default: "Accepted",
    },
    warehouseId: { type: String, default: "main" },
    performedBy: { type: String, required: true },
    performedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

QualityCheckSchema.index({ batchId: 1 });
QualityCheckSchema.index({ inwardEntryId: 1 });

export const QualityCheck =
  models.QualityCheck ?? model<IQualityCheck>("QualityCheck", QualityCheckSchema);
