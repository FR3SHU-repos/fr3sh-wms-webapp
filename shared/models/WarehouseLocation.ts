import { Schema, Document, model, models } from "mongoose";

export interface IWarehouseLocation extends Document {
  warehouseId: string;
  type: "warehouse" | "zone" | "aisle" | "rack" | "shelf" | "bin";
  code: string;
  name: string;
  parentId?: string;
  zoneCode?: string;
  storageType: "Ambient" | "Cold" | "Cool" | "Refrigerated" | "Frozen";
  temperatureRange?: string;
  capacityKg?: number;
  capacityUnits?: number;
  currentOccupancy: number;
  productCategoryMapping?: string[];
  barcodeUrl?: string;
  qrCodeUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseLocationSchema = new Schema<IWarehouseLocation>(
  {
    warehouseId: { type: String, default: "main" },
    type: { type: String, required: true, enum: ["warehouse", "zone", "aisle", "rack", "shelf", "bin"] },
    code: { type: String, required: true },
    name: { type: String, required: true },
    parentId: String,
    zoneCode: String,
    storageType: {
      type: String,
      enum: ["Ambient", "Cold", "Cool", "Refrigerated", "Frozen"],
      default: "Ambient",
    },
    temperatureRange: String,
    capacityKg: Number,
    capacityUnits: Number,
    currentOccupancy: { type: Number, default: 0 },
    productCategoryMapping: [String],
    barcodeUrl: String,
    qrCodeUrl: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

WarehouseLocationSchema.index({ warehouseId: 1, type: 1, code: 1 });

export const WarehouseLocation =
  models.WarehouseLocation ??
  model<IWarehouseLocation>("WarehouseLocation", WarehouseLocationSchema);
