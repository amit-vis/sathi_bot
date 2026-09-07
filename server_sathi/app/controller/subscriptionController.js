import { createCredit, createPaymentAndCredit, createSubscription, getAllSubscription, getSubscriptionUserWise, updateSubInDatabase } from "../model/subscription.js";
import { getUserByMail } from "../model/user.js";
import logger from "../utils/logger.js";
export const createSubscriptionController = async (req, res) => {
    try {
        const { subscriptionData } = req.body;
        const getUser = await getUserByMail(req.user.id);
        if (!getUser) {
            return res.status(400).json({
                message: "User not exist",
                success: false,
            });
        }
        const insertSubscription = await createSubscription(subscriptionData);
        logger.info("Subscription created successfully", {
            type: "SUBSCRIPTION_CREATED",
            userId: req.user.id,
            action: "createSubscriptionController",
            details: { subscriptionDataKeys: Object.keys(subscriptionData || {}) }
        });
        return res.status(200).json({
            message: "you have subscribe successfully!",
            success: true,
            insertSubscription
        });
    }
    catch (error) {
        logger.error("Failed to create subscription", {
            type: "SUBSCRIPTION_CREATED",
            userId: req.user?.id,
            action: "createSubscriptionController",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return res.status(500).json({
            message: "Error in creating the subscription",
            success: false,
            error: error
        });
    }
};
export const handleSubscription = async (req, res) => {
    try {
        const { userId, plan, paymentMedium } = req.body;
        if (!userId || !plan) {
            return res.status(400).json({ message: "userId and plan required" });
        }
        console.log("here is the req.user", req.user);
        if (!req.user?.id && !req.user?.isAdmin) {
            return res.status(400).json({
                message: "you are not authorized to update the status!",
                success: false
            });
        }
        const now = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        // ─── SUBSCRIPTION_ACTIVATION ───
        if (plan === "SUBSCRIPTION_ACTIVATION") {
            const result = await createPaymentAndCredit(userId, {
                subscriptionStatus: true,
                plan: "SUBSCRIPTION_ACTIVATION",
                startDate: now,
                endDate: endDate,
                payments: [
                    {
                        amount: 50,
                        paymentFlow: "IN",
                        paymentType: "ACTIVATION_CHARGE",
                        paymentStatus: "SUCCESS",
                        paymentMedium: paymentMedium || "UPI",
                    },
                ],
                // koi credit log nahi
            });
            logger.info("Subscription activated", {
                type: "SUBSCRIPTION_ACTIVATION",
                userId,
                action: "handleSubscription",
            });
            return res.status(200).json({
                message: "Subscription activated successfully",
                data: result,
            });
        }
        // ─── BASIC PLAN ───
        if (plan === "BASIC") {
            const currentSub = await getSubscriptionUserWise(userId);
            if (!currentSub) {
                return res.status(404).json({ message: "Subscription not found" });
            }
            const creditsToAdd = 150; // BASIC plan mein 150 credits
            const rechargeAmount = 250;
            const activationAmount = 50;
            const newTotalCredits = currentSub.totalCredits + creditsToAdd;
            const newRemainingCredits = currentSub.remainingCredits + creditsToAdd;
            const newTotalAmount = Number(currentSub.totalAmount) + rechargeAmount + activationAmount;
            const result = await createPaymentAndCredit(userId, {
                subscriptionStatus: true,
                plan: "BASIC",
                startDate: now,
                endDate: endDate,
                totalCredits: newTotalCredits,
                usedCredits: currentSub.usedCredits,
                remainingCredits: newRemainingCredits,
                totalAmount: newTotalAmount,
                payments: [
                    {
                        amount: activationAmount,
                        paymentFlow: "IN",
                        paymentType: "ACTIVATION_CHARGE",
                        paymentStatus: "SUCCESS",
                        paymentMedium: paymentMedium || "UPI",
                    },
                    {
                        amount: rechargeAmount,
                        paymentFlow: "IN",
                        paymentType: "RECHARGE",
                        paymentStatus: "SUCCESS",
                        paymentMedium: paymentMedium || "UPI",
                    },
                ],
                credits: [
                    {
                        creditCount: creditsToAdd,
                        creditFlow: "IN",
                        creditType: "USER_RECHARGE",
                        balanceBefore: currentSub.remainingCredits,
                        balanceAfter: newRemainingCredits,
                    },
                ],
            });
            logger.info("Basic plan activated", {
                type: "BASIC_PLAN_ACTIVATED",
                userId,
                action: "handleSubscription",
                details: {
                    creditsAdded: creditsToAdd,
                    totalAmount: newTotalAmount,
                },
            });
            return res.status(200).json({
                message: "Basic plan activated successfully",
                data: result,
            });
        }
        return res.status(400).json({ message: "Invalid plan type" });
    }
    catch (error) {
        console.error(error);
        logger.error("Subscription handler failed", {
            type: "SUBSCRIPTION_ERROR",
            action: "handleSubscription",
            error: error.message,
            stack: error.stack,
        });
        return res.status(500).json({
            message: "Error processing subscription",
            error: error.message,
        });
    }
};
export const userWiseCreditController = async (req, res) => {
    try {
        const paymentPage = Number(req.query.paymentPage) || 1;
        const creditPage = Number(req.query.creditPage) || 1;
        const limit = Number(req.query.limit) || 10;
        if (!req.user?.id) {
            return res.status(400).json({
                message: "user id does not exist!",
                success: false
            });
        }
        const subscriptionData = await getSubscriptionUserWise(req.user.id, paymentPage, creditPage, limit);
        logger.info("User wise subscription data fetched", {
            type: "GET_USER_CREDIT",
            userId: req.user.id,
            action: "userWiseCreditController",
            details: { paymentPage, creditPage, limit }
        });
        return res.status(200).json({
            message: "subscription data fetched successfully!",
            success: true,
            data: subscriptionData
        });
    }
    catch (error) {
        console.error(error);
        logger.error("Failed to fetch user wise credit", {
            type: "GET_USER_CREDIT",
            userId: req.user?.id,
            action: "userWiseCreditController",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return res.status(500).json({
            message: "error in subscription fetching",
            error: error,
            success: false
        });
    }
};
export const getAllSubscriptionController = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const getAllSubs = await getAllSubscription(page, limit);
        logger.info("All subscriptions fetched", {
            type: "GET_ALL_SUBSCRIPTIONS",
            userId: req.user?.id,
            action: "getAllSubscriptionController",
            details: { page, limit }
        });
        return res.status(200).json({
            message: "all subscription data",
            success: true,
            data: getAllSubs
        });
    }
    catch (error) {
        logger.error("Failed to fetch all subscriptions", {
            type: "GET_ALL_SUBSCRIPTIONS",
            userId: req.user?.id,
            action: "getAllSubscriptionController",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return res.status(500).json({
            message: "error in fetching all subscriptions",
            error: error,
            success: false
        });
    }
};
//# sourceMappingURL=subscriptionController.js.map