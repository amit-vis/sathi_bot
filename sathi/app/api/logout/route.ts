import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // backend ko bhi logout bolo (optional, agar backend token invalidate karta hai)
  const rt = req.cookies.get("rt")?.value;
  
  try {
    await fetch(`${process.env.BACKEND_URL}/user/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `rt=${rt}`,
      },
    });
  } catch {}

  // cookie delete karo
  const response = NextResponse.json({ success: true });
  response.cookies.delete("rt");

  return response;
}