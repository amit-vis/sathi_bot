import { Prisma } from "@prisma/client";
export declare const insertRefreshToken: (refreshData: any) => Promise<{
    id: string;
    tokenHash: string;
    familyId: string;
    userId: string;
    used: boolean;
    revoked: boolean;
    usedAt: Date | null;
    userAgent: string | null;
    ip: string | null;
    expiresAt: Date;
    createdAt: Date;
}>;
export declare const consumeRefreshToken: (tokenHash: string) => Promise<{
    familyId: string;
    id: string;
    userId: string;
} | null>;
export declare const findHash: (hash: any) => Promise<{
    expiresAt: Date;
    familyId: string;
    id: string;
    revoked: boolean;
    used: boolean;
    userId: string;
} | null | undefined>;
export declare const revokeFamily: (familyId: string, userId: string) => Promise<Prisma.BatchPayload | undefined>;
export declare const revokeAllForUser: (userId: any) => Promise<Prisma.BatchPayload | undefined>;
export declare const listSessions: (token: string, userId: string) => Promise<{
    isCurrentDevice: boolean;
    createdAt: Date;
    familyId: string;
    ip: string | null;
    userAgent: string | null;
}[]>;
export declare const deletExpired: () => Promise<Prisma.BatchPayload>;
//# sourceMappingURL=refreshToken.d.ts.map