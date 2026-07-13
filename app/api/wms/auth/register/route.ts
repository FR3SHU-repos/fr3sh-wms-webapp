import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { mongoDB } from "@/shared/lib/db/mongo";
import { WarehouseUser } from "@/shared/models/WarehouseUser";
import { Warehouse } from "@/shared/models/Warehouse";
import { signWMSToken, makeWMSCookie } from "@/shared/lib/auth";

const SELF_SERVICE_ROLES = [
  "Warehouse Manager",
  "Receiving Staff",
  "QC Staff",
  "Picker",
  "Packer",
  "Dispatcher",
  "Inventory Auditor",
  "Finance Viewer",
];

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ success: false, message: "Name, email, password, and role are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ success: false, message: "Password must be at least 8 characters" }, { status: 400 });
  }

  if (!SELF_SERVICE_ROLES.includes(role)) {
    return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 });
  }

  await mongoDB();

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await WarehouseUser.findOne({ email: normalizedEmail });
  if (existing) {
    return NextResponse.json({ success: false, message: "An account with this email already exists" }, { status: 409 });
  }

  const warehouse = await Warehouse.findOne({ isActive: true }).sort({ createdAt: 1 }).lean();
  const warehouseId = (warehouse as { warehouseCode?: string } | null)?.warehouseCode ?? "main";
  const warehouseCode = warehouseId;
  const warehouseName = (warehouse as { name?: string } | null)?.name ?? "Main Warehouse";

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await WarehouseUser.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
    warehouseId,
  });

  const token = signWMSToken({
    id: String(user._id),
    email: user.email,
    role: user.role,
    name: user.name,
    warehouseId,
    warehouseCode,
  });

  const response = NextResponse.json({
    success: true,
    message: "Account created",
    data: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.photo,
      warehouseId,
      warehouseCode,
      warehouseName,
    },
  }, { status: 201 });

  response.cookies.set(makeWMSCookie(token));
  return response;
}
