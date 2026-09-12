import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const backendPath = path.join("/");
    const rt = req.cookies.get("rt")?.value;
    const authHeader = req.headers.get("authorization");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (rt) headers["Cookie"] = `rt=${rt}`;
    if (authHeader) headers["Authorization"] = authHeader;

    const fetchOptions: RequestInit = {
        method: req.method,
        headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
        const body = await req.text();
        if (body) fetchOptions.body = body;
    }

    const res = await fetch(`${process.env.BACKEND_URL}/${backendPath}`, fetchOptions);
    const data = await res.json();

    const response = NextResponse.json(data, { status: res.status });

    // refresh token rotation handle karo
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
        const rtMatch = setCookie.match(/rt=([^;]+)/);
        if (rtMatch) {
            response.cookies.set("rt", decodeURIComponent(rtMatch[1]), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 86400,
                path: "/",
            });
        }
    }

    return response;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;