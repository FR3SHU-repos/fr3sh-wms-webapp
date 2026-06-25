import { NextResponse } from "next/server";
import { getWMSSession } from "@/shared/lib/auth";
import { mongoDB } from "@/shared/lib/db/mongo";
import { WarehouseUser } from "@/shared/models/WarehouseUser";

export async function GET() {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();

  const userDoc = await WarehouseUser.findById(session.id).select("-passwordHash");
  if (!userDoc) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

  return NextResponse.json({
    success: true,
    data: {
      id: String(userDoc._id),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      photo: userDoc.photo,
    },
  });
}
