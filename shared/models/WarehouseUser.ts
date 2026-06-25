import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IWarehouseUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  photo?: string;
  warehouseId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseUserSchema = new Schema<IWarehouseUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: [
        "Super Admin",
        "Warehouse Admin",
        "Warehouse Manager",
        "Receiving Staff",
        "QC Staff",
        "Picker",
        "Packer",
        "Dispatcher",
        "Inventory Auditor",
        "Finance Viewer",
      ],
    },
    photo: String,
    warehouseId: { type: String, default: "main" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

export const WarehouseUser =
  models.WarehouseUser ?? model<IWarehouseUser>("WarehouseUser", WarehouseUserSchema);
