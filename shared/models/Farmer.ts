import { Schema, Document, model, models } from "mongoose";

export interface IFarmer extends Document {
  farmerId: string;
  name: string;
  phone?: string;
  email?: string;
  location?: string;
  state?: string;
  type: "Individual Farmer" | "FPO" | "Cooperative" | "Trader" | "Company";
  organicCertNumber?: string;
  certExpiryDate?: Date;
  notes?: string;
  isActive: boolean;
  warehouseId: string;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerSchema = new Schema<IFarmer>(
  {
    farmerId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    phone: String,
    email: String,
    location: String,
    state: String,
    type: {
      type: String,
      required: true,
      enum: ["Individual Farmer", "FPO", "Cooperative", "Trader", "Company"],
      default: "Individual Farmer",
    },
    organicCertNumber: String,
    certExpiryDate: Date,
    notes: String,
    isActive: { type: Boolean, default: true },
    warehouseId: { type: String, default: "main" },
  },
  { timestamps: true },
);

FarmerSchema.index({ name: 1 });
FarmerSchema.index({ isActive: 1 });

// Use 'wms_suppliers' collection to avoid conflict with farmers-republic 'farmers' collection
export const Farmer = models.WMSSupplier ?? model<IFarmer>("WMSSupplier", FarmerSchema, "wms_suppliers");
