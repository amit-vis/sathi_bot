export declare const createAdmin: (userData: any) => Promise<{
    id: string;
    userEmail: string | null;
    userMobileNumber: string | null;
    otpCode: string | null;
    otpExpiresAt: Date | null;
    isEmailVerified: boolean;
    isMobileVerified: boolean;
    AccessToken: string | null;
    ExpiryTimestamp: Date | null;
    mailRefreshToken: string | null;
    userName: string | null;
    organizationName: string | null;
    lastLoginAt: Date | null;
    isBlocked: boolean;
    blockTimestamp: Date | null;
    isDelete: boolean;
    deleteTimeStamp: Date | null;
    Labels: string[];
    LabelsIds: string[];
    msSubscriptionId: string | null;
    mailType: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
interface GetUsersParams {
    page: number;
    limit: number;
    search?: string | undefined;
    status?: "active" | "inactive" | "expiring" | undefined;
}
export declare const getUsersWithSubscription: ({ page, limit, search, status, }: GetUsersParams) => Promise<{
    users: {
        createdAt: Date;
        id: string;
        subscriptions: {
            endDate: Date | null;
            id: string;
            plan: import("@prisma/client").$Enums.SubscriptionPlan;
            remainingCredits: number;
            startDate: Date | null;
            subscriptionStatus: boolean;
            totalAmount: import("@prisma/client-runtime-utils").Decimal | null;
            totalCredits: number;
            usedCredits: number;
        } | null;
        userChild: {
            id: string;
            userId: string;
            isAdmin: boolean;
            watchExpiresAt: Date | null;
            password: string | null;
            deactivationReason: string | null;
            deleteInputText: string | null;
        } | null;
        userEmail: string | null;
        userMobileNumber: string | null;
        userName: string | null;
    }[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}>;
export declare const getUserSubscriptionDetail: (userId: string) => Promise<{
    createdAt: Date;
    id: string;
    subscriptions: {
        creditLogs: {
            balanceAfter: number;
            balanceBefore: number;
            createdAt: Date;
            creditCount: number;
            creditFlow: import("@prisma/client").$Enums.CreditFlow;
            creditType: import("@prisma/client").$Enums.CreditType;
            id: string;
            remarks: string | null;
        }[];
        endDate: Date | null;
        id: string;
        paymentLogs: {
            amount: import("@prisma/client-runtime-utils").Decimal;
            createdAt: Date;
            id: string;
            paymentFlow: import("@prisma/client").$Enums.PaymentFlow;
            paymentMedium: import("@prisma/client").$Enums.PaymentMedium;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            paymentType: import("@prisma/client").$Enums.PaymentType;
            remarks: string | null;
            transactionId: string | null;
        }[];
        plan: import("@prisma/client").$Enums.SubscriptionPlan;
        remainingCredits: number;
        startDate: Date | null;
        subscriptionStatus: boolean;
        totalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        totalCredits: number;
        usedCredits: number;
    } | null;
    userEmail: string | null;
    userMobileNumber: string | null;
    userName: string | null;
} | null>;
export {};
//# sourceMappingURL=admin.d.ts.map