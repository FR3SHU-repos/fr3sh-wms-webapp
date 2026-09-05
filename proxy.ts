import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyWMSToken } from "@/shared/lib/auth";

const PUBLIC_PATHS = ["/login", "/register", "/api/wms/auth/login", "/api/wms/auth/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  if (!pathname.startsWith("/wms") && !pathname.startsWith("/api/wms")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  if (!token || !verifyWMSToken(token)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/wms/:path*", "/api/wms/:path*"],
};
