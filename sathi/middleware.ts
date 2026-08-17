import {NextRequest, NextResponse} from "next/server";

const publicRoutes = ["/signin", "/signup", "/otp", "/subscription"];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
    const refreshToken = req.cookies.get("rt")?.value;

    // Logged in user public pages pe nahi ja sakta
    if (isPublic && refreshToken) {
        return NextResponse.redirect(new URL("/dashboard", req.url)); // dashboard/home pe bhejo
    }

    // Logged out user protected pages pe nahi ja sakta
    if (!isPublic && !refreshToken) {
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    // static files aur API routes skip karo
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};