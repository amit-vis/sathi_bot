import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const res = await fetch(
        `${process.env.BACKEND_URL}/user/verifyOtp/${body.userEmail}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ otp: body.otp }),
        }
    );

    const data = await res.json();
    if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
    }

    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json({
        accessToken: data.accessToken,
        user: data.user,
    });

    const setCookie = res.headers.get("set-cookie");   // ← yeh line
    if (setCookie) {
        const rtMatch = setCookie.match(/rt=([^;]+)/);
        if (rtMatch) {
            const rtValue = decodeURIComponent(rtMatch[1]);
            response.cookies.set("rt", rtValue, {
                httpOnly: true,
                secure: isProduction,
                sameSite: "lax",
                maxAge: 7 * 86_400_000,
                path: "/",
            });
        }
    }

    return response;
}