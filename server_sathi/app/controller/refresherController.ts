import { clearCookieOptions, createRefreshToken, hashToken, REFRESH_COOKIE, refreshCookieOptions, refreshExpiry, signAccessToken } from "../config/tokens.js"
import { consumeRefreshToken, findHash, insertRefreshToken, revokeFamily } from "../model/refreshToken.js";
import { getUserByMail } from "../model/user.js";

export const issueTokens = async (res:any, user:any, familyId:any, req:any)=>{
    try {
        const {raw, hash} = createRefreshToken();
        await insertRefreshToken({
            tokenHash: hash,
            familyId,
            userId: user?.id,
            expiresAt: refreshExpiry(),
            userAgent: req.get("user-agent"),
            ip: req.ip
        });

        res.cookie(REFRESH_COOKIE, raw, refreshCookieOptions);
        return signAccessToken(user)
    } catch (error: any) {
        throw error
    }
}

export const refresh = async (req: any, res: any)=>{
    try {
        const raw = req.cookies?.[REFRESH_COOKIE];
        if(!raw){
            return res.status(401).json({
                error: "NO_REFRESH_TOKEN"
            })
        }
        const hash = hashToken(raw);
        const consumed = await consumeRefreshToken(hash);
        if(!consumed){
            const known = await findHash(hash);
            if(known?.used){
                await revokeFamily(known.familyId, known.userId);
                console.warn('[security] refresh token reuse', {
                    userId: known.userId,
                    familyId: known.familyId,
                    ip: req.ip
                })
            }

            res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
            return res.status(401).json({
                error: "INVALID_REFRESH_TOKEN"
            })
        }
        const user = await getUserByMail(consumed.userId);
  
        if(!user){
            res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
            return res.status(401).json({
                error: "USER_NOT_FOUND"
            })
        }

        const accessToken = await issueTokens(res, user, consumed.familyId, req);
        return res.json({accessToken, user})
    } catch (error: any) {
        return res.status(500).json({
            message: "error in refresh Token",
            error: error?.message
        })
    }
}