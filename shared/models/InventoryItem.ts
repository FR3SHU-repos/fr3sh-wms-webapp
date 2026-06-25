import { Schema, Document, model, models } from "mongoose";

export interface IInventoryItem extends Document {
  skuCode: string;
  productName: string;
  category: string;
  zoneCode: string;
  warehouseId: string;
  totalStock: number;
  reservedStock: number;
  damagedStock: number;
  expiredStock: number;
  returnedStock: number;
  inTransitStock: number;
  unit: string;
  reorderLevel?: number;
  isActive: boolean;
  lastUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>(
  {
    skuCode: { type: String, required: true },
    productName: { type: String, required: true },
    category: String,
    zoneCode: String,
    warehouseId: { type: String, default: "main" },
    totalStock: { type: Number, default: 0 },
    reservedStock: { type: Number, default: 0 },
    damagedStock: { type: Number, default: 0 },
    expiredStock: { type: Number, default: 0 },
    returnedStock: { type: Number, default: 0 },
    inTransitStock: { type: Number, default: 0 },
    unit: { type: String, default: "kg" },
    reorderLevel: Number,
    isActive: { type: Boolean, default: true },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

InventoryItemSchema.index({ skuCode: 1, warehouseId: 1 }, { unique: true });

export const InventoryItem =
  models.InventoryItem ?? model<IInventoryItem>("InventoryItem", InventoryItemSchema);
