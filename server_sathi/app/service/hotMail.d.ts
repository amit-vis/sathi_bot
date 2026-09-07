export declare const redirectMicrosoft: (req: any, res: any) => Promise<any>;
export declare const createFolder: (accessToken: string, folderName: string) => Promise<any>;
export declare const fetchUserInfoMicrosoft: (accessToken: string) => Promise<{
    email: any;
    name: any;
} | undefined>;
export declare const Subscription: (accessToken: string) => Promise<any>;
export declare const callbackUrlMicrosoft: (req: any, res: any) => Promise<any>;
export declare const generateNewAccessTokenOutlook: (userMail: string) => Promise<any>;
export declare const getAllUnreadMessages: (accessToken: string) => Promise<any[]>;
export declare const markAsProcessed: (accessToken: string, messageIds: string[], _userMail: string) => Promise<boolean>;
export declare const markAsBotBlocked: (accessToken: string, messageIds: string[], _userMail: string) => Promise<boolean>;
interface ExtractionConfig {
    includeAttachments?: boolean;
    maxFileSize?: number;
}
export declare const getMessages: (accessToken: string, messageId: string, config?: ExtractionConfig) => Promise<any>;
export declare const mailAccessRealTimeOutlook: (userEmail: string) => Promise<any>;
export declare const renewSubscription: (subscriptionId: string, userEmail: string) => Promise<any>;
export declare const fetchAllMeta: (accessToken: string, messageIds: string[]) => Promise<any[]>;
export declare const stopUserWatch: (req: any, res: any) => Promise<any>;
export declare const notification: (req: any, res: any) => Promise<any>;
export {};
//# sourceMappingURL=hotMail.d.ts.map