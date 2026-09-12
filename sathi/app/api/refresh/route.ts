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

    // set-cookie header se naya rt parse karo
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
        const rtMatch = setCookie.match(/rt=([^;]+)/);
        if (rtMatch) {
            const rtValue = decodeURIComponent(rtMatch[1]);
            response.cookies.set("rt", rtValue, {
                httpOnly: true,
                secure: isProduction,
                sameSite: "lax",
                maxAge: 7 * 86400,
                path: "/",
            });
        }
    }

    // fallback — body se bhi check karo
    if (data.refreshToken) {
        response.cookies.set("rt", data.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            maxAge: 7 * 86400,
            path: "/",
        });
    }

    return response;
}