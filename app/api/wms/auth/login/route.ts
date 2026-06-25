import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { mongoDB } from "@/shared/lib/db/mongo";
import { WarehouseUser } from "@/shared/models/WarehouseUser";
import { Warehouse } from "@/shared/models/Warehouse";
import { signWMSToken, makeWMSCookie } from "@/shared/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
  }

  await mongoDB();

  const user = await WarehouseUser.findOne({ email: email.toLowerCase().trim(), isActive: true });
  if (!user) {
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  }

  await WarehouseUser.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

  // Look up the warehouse to get its code
  const warehouse = await Warehouse.findOne({ warehouseCode: user.warehouseId }).lean();
  const warehouseCode = (warehouse as { warehouseCode?: string } | null)?.warehouseCode ?? user.warehouseId;
  const warehouseName = (warehouse as { name?: string } | null)?.name ?? "Main Warehouse";

  const token = signWMSToken({
    id: String(user._id),
    email: user.email,
    role: user.role,
    name: user.name,
    warehouseId: user.warehouseId,
    warehouseCode,
  });

  const response = NextResponse.json({
    success: true,
    message: "Login successful",
    data: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.photo,
      warehouseId: user.warehouseId,
      warehouseCode,
      warehouseName,
    },
  });

  response.cookies.set(makeWMSCookie(token));
  return response;
}
