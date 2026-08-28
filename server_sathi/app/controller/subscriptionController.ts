import { createCredit, createPaymentAndCredit, createSubscription, getAllSubscription, getSubscriptionUserWise, updateSubInDatabase } from "../model/subscription.js";
import { getUserByMail } from "../model/user.js";
import logger from "../utils/logger.js";

export const createSubscriptionController = async (req: any, res: any) => {
    try {
        const { subscriptionData } = req.body;
        const getUser = await getUserByMail(req.user.id);
        
        if (!getUser) {
            return res.status(400).json({
                message: "User not exist",
                success: false,
            })
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
        })

    } catch (error) {
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
        })
    }
}

export const updateSubscription = async (req: any, res: any) => {
    try {
        const { subscriptionId } = req.query;
        const { status } = req.body;

        if (!req.user?.id) {
            return res.status(401).json({
                message: "You are not authorized to update the status!",
                success: false
            });
        }
        if (!subscriptionId) {
            return res.status(400).json({
                message: "Subscription id does not exist",
                success: false
            });
        }

        const newStatus = !!status; 
        const updatedSub: any = await updateSubInDatabase(subscriptionId, newStatus); 
        
        logger.info("Subscription status updated", {
            type: "SUBSCRIPTION_UPDATED",
            userId: req.user.id,
            action: "updateSubscription",
            details: { subscriptionId, newStatus }
        });

        return res.status(200).json({
            message: "Status updated successfully!",
            success: true,
            data: updatedSub
        });

    } catch (error) {
        logger.error("Failed to update subscription", {
            type: "SUBSCRIPTION_UPDATED",
            userId: req.user?.id,
            action: "updateSubscription",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });

        return res.status(500).json({
            message: "Error in updating the subscription status!",
            success: false,
            error: error
        });
    }
}

export const createPaymentAndCreditController = async (req: any, res: any) => {
    try {
        const { combinedData } = req.body;
        if (!req.user?.id) {
            return res.status(400).json({
                message: "need to loggedin or not authorized user!",
                success: false
            })
        }

        const resu = await createPaymentAndCredit(req.user.id, combinedData);
        
        logger.info("Payment and credit created", {
            type: "PAYMENT_CREDIT_CREATED",
            userId: req.user.id,
            action: "createPaymentAndCreditController",
            details: { combinedDataKeys: Object.keys(combinedData || {}) }
        });

        return res.status(200).json({
            message: "payment and credit has been created!",
            success: true,
            data: resu
        })

    } catch (error) {
        logger.error("Failed to create payment and credit", {
            type: "PAYMENT_CREDIT_CREATED",
            userId: req.user?.id,
            action: "createPaymentAndCreditController",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });

        return res.status(500).json({
            message: "error in creating the payment and credit!",
            error: error
        })
    }
}

export const createCreditController = async (req: any, res: any) => {
    const { combinedData } = req.body;
    const { userId } = req.query;
    try {
        if (!userId) {
            return res.status(400).json({
                message: "user id does not exist",
                success: false
            })
        }
        const creditres = await createCredit(userId, combinedData);
        
        logger.info("Credit created", {
            type: "CREDIT_CREATED",
            userId: userId,
            action: "createCreditController",
            details: { combinedDataKeys: Object.keys(combinedData || {}) }
        });

        return res.status(200).json({
            message: "logs created successfully!",
            success: true,
            data: creditres
        })
    } catch (error) {
        logger.error("Failed to create credit", {
            type: "CREDIT_CREATED",
            userId: userId, 
            action: "createCreditController",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });

        return res.status(500).json({
            message: "error in creating credit logs",
            error: error
        })
    }
}

export const userWiseCreditController = async (req: any, res: any) => {
    try {
        const paymentPage = Number(req.query.paymentPage) || 1;
        const creditPage = Number(req.query.creditPage) || 1;
        const limit = Number(req.query.limit) || 10;
        
        if (!req.user?.id) {
            return res.status(400).json({
                message: "user id does not exist!",
                success: false
            })
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
        })
        
    } catch (error) {
        console.error(error)
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
        })
    }
}

export const getAllSubscriptionController = async (req: any, res: any) => {
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
    } catch (error) {
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
}