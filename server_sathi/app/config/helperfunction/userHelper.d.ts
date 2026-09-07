export declare const sendOTP: () => string;
export declare const encryptToken: (token: any) => string;
export declare const decryptionToken: (encypttoken: any) => string;
export declare const buildWhere: (identifier: string) => {
    userEmail: string;
    isBlocked: boolean;
    isDelete: boolean;
    id?: never;
    userMobileNumber?: never;
} | {
    userEmail?: never;
    id: string;
    isBlocked: boolean;
    isDelete: boolean;
    userMobileNumber?: never;
} | {
    userEmail?: never;
    id?: never;
    userMobileNumber: string;
    isBlocked: boolean;
    isDelete: boolean;
};
export declare const PinGenerator: () => string;
export declare const getEmailProvider: (email: string) => "gmail" | "outlook" | "unknown";
export declare function getClientIp(req: Request): string;
//# sourceMappingURL=userHelper.d.ts.map