/**
 * structuralFilter.ts
 *
 * Sirf STRUCTURAL signals pe block karta hai — content/keywords pe NAHI.
 *
 * Structural = mail ki banawat batati hai ki ye 1-to-many bulk mail hai.
 * Koi vendor tumhe List-Unsubscribe header ke saath purchase order nahi bhejta.
 * Isliye yahan false-positive risk ~0 hai.
 *
 * Content ka faisla (business hai ya nahi) LLM karega. Ye uska kaam nahi.
 *
 * FAIL-OPEN: doubt ho to PASS. Missed lead > wasted LLM call.
 */
export interface MailInput {
    messageId: string;
    from: string;
    subject: string;
    body?: string;
    /** Gmail API ka message.labelIds — CATEGORY_PROMOTIONS etc. */
    labelIds?: string[];
    /** Lowercased header map — { "list-unsubscribe": "<...>" } */
    headers?: Record<string, string>;
    [key: string]: any;
}
export interface FilterVerdict {
    blocked: boolean;
    /** Kis rule ne block kiya — logging ke liye. Pass hua to null. */
    rule: string | null;
    /** Debug detail */
    detail?: string;
}
/** "Amit <amit@gmail.com>" -> "amit@gmail.com" */
export declare const extractEmail: (from: unknown) => string;
export declare const isBulkMail: (mail: MailInput) => FilterVerdict;
export interface FilterOptions {
    /** Ye senders/domains hamesha pass — filter bypass */
    whitelist?: string[];
    /** Ye senders/domains hamesha block */
    blacklist?: string[];
}
export interface FilterOutput {
    /** LLM ko ye bhejo */
    allowed: MailInput[];
    /** Ye label karke chhod do */
    blocked: Array<{
        mail: MailInput;
        rule: string;
        detail?: string;
    }>;
}
export declare const filterMail: (mails: MailInput[], opts?: FilterOptions) => FilterOutput;
/**
 * Ye tumhare getmessages() me use karo.
 * Gmail ka messages.get response object pass karo.
 *
 *   const res = await gmail.users.messages.get({ userId: "me", id, format: "full" });
 *   const { labelIds, headers } = extractGmailMeta(res.data);
 */
export declare const extractGmailMeta: (gmailMessage: any) => {
    labelIds: string[];
    headers: Record<string, string>;
};
/**
 * Sirf classification ke liye chahiye to `format: "metadata"` use karo —
 * body download hi nahi hoga, 5x faster + kam quota.
 *
 *   gmail.users.messages.get({
 *     userId: "me", id, format: "metadata",
 *     metadataHeaders: ["From", "Subject", "List-Unsubscribe", "List-Id", "Precedence"]
 *   })
 *
 * Jo mails pass ho jayein, sirf unka full body fetch karo.
 * Isse 50-60% mails ka body kabhi download hi nahi hoga.
 */
export declare const CLASSIFY_HEADERS: string[];
export declare function chunkArray<T>(arr: T[], size: number): T[][];
export declare function calculateCompleteness(data: any): number;
export declare function extractTokenUsage(result: any): {
    input_tokens: any;
    output_tokens: any;
    total_tokens: any;
};
//# sourceMappingURL=helper.d.ts.map