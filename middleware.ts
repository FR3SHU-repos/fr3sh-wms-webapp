import type { NextRequest } from "next/server";
import { updateSession } from "@/shared/lib/supabase/middleware";

// Server-side Supabase session refresh + /wms/* route guard. Supersedes the old
// hand-rolled proxy.ts (which Next never auto-invoked).
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/wms/:path*", "/api/wms/:path*", "/login", "/register", "/auth/:path*"],
};
