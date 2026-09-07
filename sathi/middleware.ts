import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/signin", "/signup", "/otp", "/admin/login"];
const openRoutes = ["/subscription"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const refreshToken = req.cookies.get("rt")?.value;

  const isPublic = publicRoutes.some((r) => pathname.startsWith(r));
  const isOpen = openRoutes.some((r) => pathname.startsWith(r));

  // open routes — kuch mat karo
  if (isOpen) return NextResponse.next();

  // logged out + protected page → signin
  if (!refreshToken && !isPublic) {
    // admin routes ke liye admin/login pe bhejo
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // logged in + public page → dashboard
  // but admin/login se redirect mat karo kyunki admin guard handle karega
  if (refreshToken && isPublic) {
    // admin/login pe hai to admin/dashboard pe bhejo
    if (pathname.startsWith("/admin/login")) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    // baaki public routes se user dashboard pe
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};