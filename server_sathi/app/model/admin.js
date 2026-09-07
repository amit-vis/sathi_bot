import { prisma } from "../config/db.js";
export const createAdmin = async (userData) => {
    const newAdminData = await prisma.user.create({
        data: {
            userEmail: userData?.userEmail,
            userName: userData?.userName,
            userChild: {
                create: {
                    isAdmin: true,
                    password: userData.password
                }
            }
        }
    });
    return newAdminData;
};
export const getUsersWithSubscription = async ({ page, limit, search, status, }) => {
    const skip = (page - 1) * limit;
    // Build where clause
    const where = {};
    // Search by name or email
    if (search && search.trim()) {
        where.OR = [
            { userName: { contains: search.trim(), mode: "insensitive" } },
            { userEmail: { contains: search.trim(), mode: "insensitive" } },
        ];
    }
    // Filter by subscription status
    if (status === "active") {
        where.subscriptions = { subscriptionStatus: true };
    }
    else if (status === "inactive") {
        where.OR = [
            { subscriptions: null },
            { subscriptions: { subscriptionStatus: false } },
        ];
        // If search is also present, combine with AND
        if (search && search.trim()) {
            where.AND = [
                {
                    OR: [
                        { userName: { contains: search.trim(), mode: "insensitive" } },
                        { userEmail: { contains: search.trim(), mode: "insensitive" } },
                    ],
                },
                {
                    OR: [
                        { subscriptions: null },
                        { subscriptions: { subscriptionStatus: false } },
                    ],
                },
            ];
            delete where.OR;
        }
    }
    else if (status === "expiring") {
        // Next 7 days mein expire hone wale
        const now = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
        where.subscription = {
            subscriptionStatus: true,
            endDate: { gte: now, lte: sevenDaysLater },
        };
    }
    // Total count for pagination
    const totalUsers = await prisma.user.count({ where });
    // Fetch users — sorted by subscription end date (nearest first, nulls last)
    const users = await prisma.user.findMany({
        where: {
            ...where,
            userChild: { isAdmin: false }
        },
        skip,
        take: limit,
        orderBy: {
            subscriptions: { endDate: "asc" },
            // subscription → subscriptions
        },
        select: {
            id: true,
            userName: true,
            userEmail: true,
            userMobileNumber: true, // userPhone → userMobileNumber
            createdAt: true,
            userChild: true,
            subscriptions: {
                select: {
                    id: true,
                    plan: true,
                    subscriptionStatus: true,
                    startDate: true,
                    endDate: true,
                    totalCredits: true,
                    usedCredits: true,
                    remainingCredits: true,
                    totalAmount: true,
                },
            },
        },
    });
    // Null endDate wale last mein aayein — manual sort
    const sorted = users.sort((a, b) => {
        const aEnd = a.subscription?.endDate;
        const bEnd = b.subscription?.endDate;
        // No subscription → bottom
        if (!aEnd && !bEnd)
            return 0;
        if (!aEnd)
            return 1;
        if (!bEnd)
            return -1;
        return new Date(aEnd).getTime() - new Date(bEnd).getTime();
    });
    const totalPages = Math.ceil(totalUsers / limit);
    return {
        users: sorted,
        pagination: {
            currentPage: page,
            totalPages,
            totalUsers,
            limit,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
};
export const getUserSubscriptionDetail = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            userName: true,
            userEmail: true,
            userMobileNumber: true, // userPhone → userMobileNumber
            createdAt: true,
            subscriptions: {
                select: {
                    id: true,
                    plan: true,
                    subscriptionStatus: true,
                    startDate: true,
                    endDate: true,
                    totalCredits: true,
                    usedCredits: true,
                    remainingCredits: true,
                    totalAmount: true,
                    paymentLogs: {
                        orderBy: { createdAt: "desc" },
                        select: {
                            id: true,
                            amount: true,
                            paymentFlow: true,
                            paymentType: true,
                            paymentStatus: true,
                            paymentMedium: true,
                            transactionId: true,
                            remarks: true,
                            createdAt: true,
                        },
                    },
                    creditLogs: {
                        orderBy: { createdAt: "desc" },
                        select: {
                            id: true,
                            creditCount: true,
                            creditFlow: true,
                            creditType: true,
                            balanceBefore: true,
                            balanceAfter: true,
                            remarks: true,
                            createdAt: true,
                        },
                    },
                },
            },
        },
    });
    return user;
};
//# sourceMappingURL=admin.js.map