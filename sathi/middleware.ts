import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/signin", "/signup", "/otp"]; // sirf logged-out ke liye
const openRoutes = ["/subscription"];                 // 👈 dono ke liye accessible

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  const isOpen = openRoutes.some((route) => pathname.startsWith(route));
  const refreshToken = req.cookies.get("rt")?.value;

  // 👇 Open routes ko kuch mat karo — sabko access do
  if (isOpen) {
    return NextResponse.next();
  }

  // Logged in user public pages pe nahi ja sakta
  if (isPublic && refreshToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Logged out user protected pages pe nahi ja sakta
  if (!isPublic && !refreshToken) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};