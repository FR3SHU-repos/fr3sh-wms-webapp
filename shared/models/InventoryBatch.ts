import { Schema, Document, model, models } from "mongoose";

export interface IInventoryBatch extends Document {
  batchId: string;
  farmerId?: string;
  farmerName: string;
  farmLocation?: string;
  productName: string;
  skuCode: string;
  zoneCode: string;
  category: string;
  harvestDate?: Date;
  packingDate?: Date;
  expiryDate?: Date;
  organicCertNumber?: string;
  qcResult: string;
  currentLocationId?: string;
  currentLocationLabel?: string;
  quantityTotal: number;
  quantityAvailable: number;
  quantityReserved: number;
  quantityDamaged: number;
  quantityExpired: number;
  quantityReturned: number;
  unit: string;
  inwardEntryId?: string;
  qcEntryId?: string;
  movementHistory: Array<{ action: string; qty: number; locationFrom?: string; locationTo?: string; by: string; at: Date; notes?: string }>;
  status: "Active" | "Near Expiry" | "Expired" | "In Transit" | "Consumed" | "Disposed";
  warehouseId: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryBatchSchema = new Schema<IInventoryBatch>(
  {
    batchId: { type: String, required: true, unique: true },
    farmerId: String,
    farmerName: { type: String, required: true },
    farmLocation: String,
    productName: { type: String, required: true },
    skuCode: { type: String, required: true },
    zoneCode: String,
    category: String,
    harvestDate: Date,
    packingDate: Date,
    expiryDate: Date,
    organicCertNumber: String,
    qcResult: { type: String, default: "Pending" },
    currentLocationId: String,
    currentLocationLabel: String,
    quantityTotal: { type: Number, required: true, default: 0 },
    quantityAvailable: { type: Number, default: 0 },
    quantityReserved: { type: Number, default: 0 },
    quantityDamaged: { type: Number, default: 0 },
    quantityExpired: { type: Number, default: 0 },
    quantityReturned: { type: Number, default: 0 },
    unit: { type: String, required: true },
    inwardEntryId: String,
    qcEntryId: String,
    movementHistory: [
      {
        action: String,
        qty: Number,
        locationFrom: String,
        locationTo: String,
        by: String,
        at: { type: Date, default: Date.now },
        notes: String,
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Near Expiry", "Expired", "In Transit", "Consumed", "Disposed"],
      default: "Active",
    },
    warehouseId: { type: String, default: "main" },
  },
  { timestamps: true },
);

InventoryBatchSchema.index({ batchId: 1 });
InventoryBatchSchema.index({ skuCode: 1 });
InventoryBatchSchema.index({ expiryDate: 1 });
InventoryBatchSchema.index({ zoneCode: 1 });
InventoryBatchSchema.index({ status: 1 });

export const InventoryBatch =
  models.InventoryBatch ?? model<IInventoryBatch>("InventoryBatch", InventoryBatchSchema);
