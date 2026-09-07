export declare const redirecTGmail: (req: any, res: any) => Promise<any>;
export declare const callbackUrl: (req: any, res: any) => Promise<any>;
export declare const generateNewAccessToken: (userMail: string) => Promise<any>;
export declare const getAllUnreadMessages: (accessToken: string) => Promise<any[]>;
export declare const markAsProcessed: (accessToken: string, messageIds: string[], userMail: string) => Promise<boolean>;
export declare const markAsbotBlocked: (accessToken: string, messageIds: string[], userMail: string) => Promise<boolean>;
interface ExtractionConfig {
    includeAttachments?: boolean;
    maxFileSize?: number;
}
export declare const getmessages: (accessToken: string, messageId: string, config?: ExtractionConfig) => Promise<any>;
export declare const notification: (req: any, res: any) => Promise<any>;
export declare const mailaccesRealTime: (userEmail: string) => Promise<any>;
export declare const getLabels: (accessToken: any) => Promise<any>;
export declare const getMessageMeta: (accessToken: string, messageId: string) => Promise<any>;
export declare const stopUserwatch: (req: any, res: any) => Promise<any>;
export {};
//# sourceMappingURL=googleMail.d.ts.map