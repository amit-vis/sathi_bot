import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { CookieOptions } from "express";



// 1. signAccessToken — userChild undefined ho sakta hai
export const signAccessToken = (user: any) => {
    return jwt.sign(
        { isAdmin: user?.userChild?.isAdmin ?? false },  // optional chaining + default
        process.env.JWTAccessTokenSecret!,
        {
            subject: user.id,
            expiresIn: "15m"
        }
    )
}

// 2. issueTokens — error handler mein req.user exist nahi karega during login

export const verifyAccessToken = (token: any) => {
    return jwt.verify(token, process.env.JWTAccessTokenSecret!)
}

export const hashToken = (raw: any) => {
    return crypto.createHash("sha256").update(raw).digest("hex");

}

export const createRefreshToken = () => {
    const raw = crypto.randomBytes(32).toString("base64url");
    return { raw, hash: hashToken(raw) }
}

export const refreshExpiry = () => {
    return new Date(Date.now() + 7 * 86_400_000)
}

export const REFRESH_COOKIE = "rt";

export const refreshCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 86_400_000
}

export const clearCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
}

