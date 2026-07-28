import { verifyAccessToken } from "./tokens.js";

export const requireAuth = async (req: any, res: any, next: any)=>{
        const header = req.headers.authorization;
        console.log(header, req)
        if(!header?.startsWith('Bearer ')){
            return res.status(401).json({
                error: 'MISSING_TOKEN'
            })
        }
        try {
            const payload = verifyAccessToken(header.slice(7));
            req.user = {id: payload.sub};
            next()
        } catch (error: any) {
            const code = error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
            return res.status(401).json({
                error: code
            })
        }
    
}