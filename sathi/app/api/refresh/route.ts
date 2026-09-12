import { NextRequest, NextResponse } from "next/server";
const isProduction = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
    const rt = req.cookies.get("rt")?.value;

    const res = await fetch(`${process.env.BACKEND_URL}/user/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": `rt=${rt}`,
        },
    });

    const data = await res.json();
    if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
    }

    const response = NextResponse.json(data);
    if (data.refreshToken) {
        response.cookies.set("rt", data.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "lax" : "lax",
            maxAge: 7 * 86_400_000,
            path: "/",
        });
    }

    return response;
}