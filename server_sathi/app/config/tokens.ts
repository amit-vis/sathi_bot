import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { CookieOptions } from "express";


export const signAccessToken = (user: any) => {
    return jwt.sign(
        {},
        process.env.JWTAccessTokenSecret!,
        {
            subject: user.id,
            expiresIn: "15m"
        }
    )
}

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