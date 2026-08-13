import { prisma } from "../config/db.js";

export const createSubscription = async (subscriptionData: any) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Build the create payload
      const createData: any = {
        userId: subscriptionData.userId,
        plan: subscriptionData.plan || "FREE",
        subscriptionStatus: subscriptionData.subscriptionStatus ?? false,
        startDate: new Date(),
        endDate: subscriptionData.endDate || null,
        totalCredits: subscriptionData.totalCredits ?? 0,
        usedCredits: subscriptionData.usedCredits ?? 0,
        remainingCredits: subscriptionData.remainingCredits ?? 0,
        totalAmount: subscriptionData.totalAmount || null,
      };

      // paymentLogs sirf tab create hoga jab data aaye
      if (subscriptionData.paymentChild?.length) {
        createData.paymentLogs = {
          create: subscriptionData.paymentChild.map((c: any) => ({
            amount: c.amount,
            paymentFlow: c.paymentFlow,
            paymentType: c.paymentType,
            paymentStatus: c.paymentStatus || "PENDING",
            transactionId: c.transactionId || null,
            remarks: c.remarks || null,
          })),
        };
      }

      // creditLogs sirf tab create hoga jab data aaye
      if (subscriptionData.creditChild?.length) {
        createData.creditLogs = {
          create: subscriptionData.creditChild.map((c: any) => ({
            creditCount: c.creditCount,
            creditFlow: c.creditFlow,
            creditType: c.creditType,
            balanceBefore: c.balanceBefore ?? 0,
            balanceAfter: c.balanceAfter ?? 0,
            remarks: c.remarks || null,
            paymentLogId: c.paymentLogId || null,
          })),
        };
      }

      return tx.subscription.create({ data: createData });
    });

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateSubInDatabase = async (subscriptionId: string, status: boolean) => {
  const result = await prisma.$transaction(async (tx) => {
    return tx.subscription.update({
      where: { id: subscriptionId},
      data: { subscriptionStatus: status },
    });
  });

  return result;
};

export const createPaymentAndCredit = async (userId: string, combinedData: any) => {
  const result = await prisma.$transaction(async (tx) => {
  
    const subscription = await tx.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // subscription update karo
    await tx.subscription.update({
      where: { userId },
      data: {
        totalCredits: combinedData.totalCredits,
        usedCredits: combinedData.usedCredits,
        remainingCredits: combinedData.remainingCredits,
        totalAmount: combinedData.totalAmount,
        subscriptionStatus: combinedData.subscriptionStatus,
        plan: combinedData.plan,
        startDate: combinedData.startDate,
        endDate: combinedData.endDate,
      },
    });

    let paymentLog = null;
    let creditLog = null;

    // paymentLog sirf tab create hoga jab data aaye
    if (combinedData.payment) {
      paymentLog = await tx.paymentLogs.create({
        data: {
          subscriptionId: subscription.id,
          amount: combinedData.payment.amount,
          paymentFlow: combinedData.payment.paymentFlow,
          paymentType: combinedData.payment.paymentType,
          paymentStatus: combinedData.payment.paymentStatus || "PENDING",
          transactionId: combinedData.payment.transactionId || null,
          remarks: combinedData.payment.remarks || null,
        },
      });
    }

    // creditLog sirf tab create hoga jab data aaye
    if (combinedData.credit) {
      creditLog = await tx.creditLogs.create({
        data: {
          subscriptionId: subscription.id,
          creditCount: combinedData.credit.creditCount,
          creditFlow: combinedData.credit.creditFlow,
          creditType: combinedData.credit.creditType,
          balanceBefore: combinedData.credit.balanceBefore ?? 0,
          balanceAfter: combinedData.credit.balanceAfter ?? 0,
          remarks: combinedData.credit.remarks || null,
          paymentLogId: paymentLog?.id || null, // auto-link payment se
        },
      });
    }

    return { paymentLog, creditLog };
  });

  return result;
};

export const createCredit = async (userId: string, combinedData: any) => {
  const result = await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findFirst({
      where: { userId },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // balance calculate karo flow ke basis pe
    let usedCredits = subscription.usedCredits;
    let remainingCredits = subscription.remainingCredits;
    let totalCredits = subscription.totalCredits;

    if (combinedData.creditFlow === "IN") {
      totalCredits += combinedData.creditCount;
      remainingCredits += combinedData.creditCount;
    } else {
      // OUT — credit kat raha hai
      if (remainingCredits < combinedData.creditCount) {
        throw new Error("Insufficient credits");
      }
      usedCredits += combinedData.creditCount;
      remainingCredits -= combinedData.creditCount;
    }

    // credit log banao with correct before/after
    const creditLog = await tx.creditLogs.create({
      data: {
        subscriptionId: subscription.id,
        creditCount: combinedData.creditCount,
        creditFlow: combinedData.creditFlow,
        creditType: combinedData.creditType,
        balanceBefore: subscription.remainingCredits,
        balanceAfter: remainingCredits,
        remarks: combinedData.remarks || null,
        paymentLogId: combinedData.paymentLogId || null,
      },
    });

    // subscription ke counters update karo
    await tx.subscription.update({
      where: { id: subscription.id },
      data: {
        totalCredits,
        usedCredits,
        remainingCredits,
      },
    });

    return creditLog;
  });

  return result;
};

export const getSubscriptionUserWise = async (
  userId: string,
  paymentPage = 1,
  creditPage = 1,
  limit = 10
) => {
  const paymentSkip = (paymentPage - 1) * limit;
  const creditSkip = (creditPage - 1) * limit;

  const result = await prisma.subscription.findUnique({
    where: { userId },
    include: {
      paymentLogs: {
        select: {
          id: true,
          amount: true,
          paymentFlow: true,
          paymentType: true,
          paymentStatus: true,
          transactionId: true,
          remarks: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: paymentSkip,
        take: limit,
      },
      creditLogs: {
        select: {
          id: true,
          creditCount: true,
          creditFlow: true,
          creditType: true,
          balanceBefore: true,
          balanceAfter: true,
          remarks: true,
          paymentLogId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: creditSkip,
        take: limit,
      },
      _count: {
        select: {
          paymentLogs: true,
          creditLogs: true,
        },
      },
    },
  });

  return result
    ? {
        ...result,
        pagination: {
          paymentLogs: {
            page: paymentPage,
            limit,
            total: result._count.paymentLogs,
            totalPages: Math.ceil(result._count.paymentLogs / limit),
          },
          creditLogs: {
            page: creditPage,
            limit,
            total: result._count.creditLogs,
            totalPages: Math.ceil(result._count.creditLogs / limit),
          },
        },
      }
    : null;
};

export const getAllSubscription = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [result, total] = await prisma.$transaction([
    prisma.subscription.findMany({
      select: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.subscription.count(),
  ]);

  return {
    data: result,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};