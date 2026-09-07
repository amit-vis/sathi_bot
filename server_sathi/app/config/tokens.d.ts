import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";
export declare const signAccessToken: (user: any) => string;
export declare const verifyAccessToken: (token: any) => string | jwt.JwtPayload;
export declare const hashToken: (raw: any) => string;
export declare const createRefreshToken: () => {
    raw: string;
    hash: string;
};
export declare const refreshExpiry: () => Date;
export declare const REFRESH_COOKIE = "rt";
export declare const refreshCookieOptions: CookieOptions;
export declare const clearCookieOptions: CookieOptions;
//# sourceMappingURL=tokens.d.ts.map