export declare const createSubscription: (subscriptionData: any) => Promise<{
    paymentLogs: {
        id: string;
        subscriptionId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentFlow: import("@prisma/client").$Enums.PaymentFlow;
        paymentType: import("@prisma/client").$Enums.PaymentType;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        paymentMedium: import("@prisma/client").$Enums.PaymentMedium;
        transactionId: string | null;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[];
} & {
    id: string;
    userId: string;
    plan: import("@prisma/client").$Enums.SubscriptionPlan;
    subscriptionStatus: boolean;
    startDate: Date | null;
    endDate: Date | null;
    totalCredits: number;
    usedCredits: number;
    remainingCredits: number;
    totalAmount: import("@prisma/client-runtime-utils").Decimal | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updateSubInDatabase: (subscriptionId: string, status: boolean) => Promise<{
    id: string;
    userId: string;
    plan: import("@prisma/client").$Enums.SubscriptionPlan;
    subscriptionStatus: boolean;
    startDate: Date | null;
    endDate: Date | null;
    totalCredits: number;
    usedCredits: number;
    remainingCredits: number;
    totalAmount: import("@prisma/client-runtime-utils").Decimal | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const createPaymentAndCredit: (userId: string, combinedData: any) => Promise<{
    subscription: {
        id: string;
        userId: string;
        plan: import("@prisma/client").$Enums.SubscriptionPlan;
        subscriptionStatus: boolean;
        startDate: Date | null;
        endDate: Date | null;
        totalCredits: number;
        usedCredits: number;
        remainingCredits: number;
        totalAmount: import("@prisma/client-runtime-utils").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
    };
    paymentLogs: {
        id: string;
        subscriptionId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentFlow: import("@prisma/client").$Enums.PaymentFlow;
        paymentType: import("@prisma/client").$Enums.PaymentType;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        paymentMedium: import("@prisma/client").$Enums.PaymentMedium;
        transactionId: string | null;
        remarks: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[];
    creditLogs: {
        id: string;
        subscriptionId: string;
        creditCount: number;
        creditFlow: import("@prisma/client").$Enums.CreditFlow;
        creditType: import("@prisma/client").$Enums.CreditType;
        balanceBefore: number;
        balanceAfter: number;
        remarks: string | null;
        paymentLogId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[];
}>;
export declare const createCredit: (userId: string, combinedData: any) => Promise<{
    id: string;
    subscriptionId: string;
    creditCount: number;
    creditFlow: import("@prisma/client").$Enums.CreditFlow;
    creditType: import("@prisma/client").$Enums.CreditType;
    balanceBefore: number;
    balanceAfter: number;
    remarks: string | null;
    paymentLogId: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const getSubscriptionUserWise: (userId: string, paymentPage?: number, creditPage?: number, limit?: number) => Promise<{
    id: string;
    userId: string;
    plan: import("@prisma/client").$Enums.SubscriptionPlan;
    subscriptionStatus: boolean;
    startDate: Date | null;
    endDate: Date | null;
    totalCredits: number;
    usedCredits: number;
    remainingCredits: number;
    totalAmount: import("@prisma/client-runtime-utils").Decimal | null;
    createdAt: Date;
    updatedAt: Date;
    pagination: {
        paymentLogs: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        creditLogs: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    _count: {
        creditLogs: number;
        paymentLogs: number;
    };
    creditLogs: {
        balanceAfter: number;
        balanceBefore: number;
        createdAt: Date;
        creditCount: number;
        creditFlow: import("@prisma/client").$Enums.CreditFlow;
        creditType: import("@prisma/client").$Enums.CreditType;
        id: string;
        paymentLogId: string | null;
        remarks: string | null;
    }[];
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
} | null>;
export declare const getAllSubscription: (page?: number, limit?: number) => Promise<{
    data: {
        user: {
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
        };
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const updateStatus: () => Promise<import("@prisma/client").Prisma.BatchPayload>;
//# sourceMappingURL=subscription.d.ts.map