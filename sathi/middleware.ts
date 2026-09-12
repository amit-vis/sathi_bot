import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/signin", "/signup", "/otp", "/admin/login"];
const openRoutes = ["/subscription"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const refreshToken = req.cookies.get("rt")?.value;

  const isPublic = publicRoutes.some((r) => pathname.startsWith(r));
  const isOpen = openRoutes.some((r) => pathname.startsWith(r));

  if (isOpen) return NextResponse.next();

  // "/" pe aaye toh redirect karo based on login
  if (pathname === "/") {
    if (refreshToken) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // baaki logic same rahega...
  if (!refreshToken && !isPublic) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (refreshToken && isPublic) {
    if (pathname.startsWith("/admin/login")) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|api|.*\\.).*)"
  ],
};