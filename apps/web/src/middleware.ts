import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";

export function middleware(request: NextRequest) {
  // Only apply middleware in API mode
  if (!USE_API) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow public routes
  if (pathname === "/login" || pathname === "/workspace") {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const token = request.cookies.get("task-tracker-access-token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // For now, we'll let the client-side handle auth checks
  // This middleware can be enhanced later for server-side auth
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

