import { Schema, Document, model, models } from "mongoose";

function genWarehouseCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export interface IWarehouse extends Document {
  warehouseCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  contactPerson: string;
  phone: string;
  email: string;
  totalZones: number;
  totalCapacityKg: number;
  status: "Active" | "Inactive" | "Planned";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseSchema = new Schema<IWarehouse>(
  {
    warehouseCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      default: genWarehouseCode,
    },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    totalZones: { type: Number, default: 0 },
    totalCapacityKg: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Planned"],
      default: "Active",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

WarehouseSchema.index({ warehouseCode: 1 }, { unique: true });
WarehouseSchema.index({ status: 1 });

export const Warehouse =
  models.Warehouse ?? model<IWarehouse>("Warehouse", WarehouseSchema);
