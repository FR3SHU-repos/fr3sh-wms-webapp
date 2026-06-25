import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set({ name: "wms_token", value: "", maxAge: 0, path: "/" });
  return response;
}
