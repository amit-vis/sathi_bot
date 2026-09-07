import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { hashToken } from "../config/tokens.js";
export const insertRefreshToken = async (refreshData) => {
    const refreshToken = await prisma.refreshToken.create({
        data: {
            tokenHash: refreshData.tokenHash,
            familyId: refreshData.familyId,
            userId: refreshData.userId,
            expiresAt: refreshData.expiresAt,
            userAgent: refreshData.userAgent || null,
            ip: refreshData.ip || null
        }
    });
    return refreshToken;
};
export const consumeRefreshToken = async (tokenHash) => {
    try {
        return await prisma.refreshToken.update({
            where: {
                tokenHash, // schema mein @unique hona zaroori
                used: false,
                revoked: false,
                expiresAt: { gt: new Date() },
            },
            data: {
                used: true,
                usedAt: new Date(),
            },
            select: { id: true, familyId: true, userId: true }, // = RETURNING
        });
    }
    catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2025") {
            return null; // rows[0] ?? null ka equivalent
        }
        throw err; // real DB errors upar jaane do
    }
};
export const findHash = async (hash) => {
    try {
        const finddata = await prisma.refreshToken.findUnique({
            where: {
                tokenHash: hash
            },
            select: {
                id: true,
                familyId: true,
                userId: true,
                used: true,
                revoked: true,
                expiresAt: true
            }
        });
        return finddata;
    }
    catch (error) {
        console.error(error);
    }
};
export const revokeFamily = async (familyId, userId) => {
    try {
        const familyData = await prisma.refreshToken.updateMany({
            where: {
                familyId: familyId,
                userId,
                revoked: false
            },
            data: {
                revoked: true
            }
        });
        return familyData;
    }
    catch (error) {
        console.error(error);
    }
};
export const revokeAllForUser = async (userId) => {
    try {
        const revokeUserData = await prisma.refreshToken.updateMany({
            where: {
                userId: userId,
                revoked: false
            },
            data: {
                revoked: true
            }
        });
        return revokeUserData;
    }
    catch (error) {
        console.error(error);
    }
};
export const listSessions = async (token, userId) => {
    try {
        if (!token) {
            throw new Error("No refresh token found");
        }
        const tokenHash = hashToken(token);
        // 1. Current device ka familyId nikalo
        const currentSession = await prisma.refreshToken.findUnique({
            where: { tokenHash },
            select: { familyId: true },
        });
        // 2. Active sessions nikalo (latest per family)
        const sessionData = await prisma.refreshToken.findMany({
            where: {
                userId,
                revoked: false,
                expiresAt: { gt: new Date() },
            },
            distinct: ["familyId"],
            orderBy: { createdAt: "desc" }, // sirf createdAt desc — latest pehle aaye
            select: {
                familyId: true,
                userAgent: true,
                ip: true,
                createdAt: true,
            },
        });
        // 3. Current device mark karo — ye missing tha
        const sessions = sessionData.map((session) => ({
            ...session,
            isCurrentDevice: session.familyId === currentSession?.familyId,
        }));
        return sessions;
    }
    catch (error) {
        console.error("Error listing sessions:", error); // actual error log karo
        throw error;
    }
};
export const deletExpired = async () => {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const rowCount = await prisma.refreshToken.deleteMany({
        where: {
            expiresAt: { lt: cutoff }
        }
    });
    return rowCount;
};
//# sourceMappingURL=refreshToken.js.map