import jwt from "jsonwebtoken";
import { verifyAccessToken } from "./tokens.js";
export const requireAuth = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'MISSING_TOKEN'
        });
    }
    try {
        const payload = verifyAccessToken(header.slice(7));
        req.user = { id: payload.sub, isAdmin: payload.isAdmin };
        next();
    }
    catch (error) {
        const code = error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
        return res.status(401).json({
            error: code
        });
    }
};
//# sourceMappingURL=middleware.js.map