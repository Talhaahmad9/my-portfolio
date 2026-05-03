import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.auth);
  const isAdminLoginRoute = pathname === "/admin";
  const isAdminDashboardRoute =
    pathname === "/admin/dashboard" || pathname.startsWith("/admin/dashboard/");

  if (isAdminDashboardRoute && !hasSession) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (isAdminLoginRoute && hasSession) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin", "/admin/dashboard", "/admin/dashboard/:path*"],
};
