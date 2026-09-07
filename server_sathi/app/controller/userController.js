import bcrypt from "bcryptjs";
import { createUser, deactivateUser, deleteOTP, deleteUser, getUserByMail, reactivateUser, recoverUser, updatePersonalDetails, updatOTP } from "../model/user.js";
import { issueTokens } from "./refresherController.js";
import { clearCookieOptions, hashToken, REFRESH_COOKIE } from "../config/tokens.js";
import { findHash, listSessions, revokeAllForUser, revokeFamily } from "../model/refreshToken.js";
import { sendOTPackGmailQueue } from "../service/queue/gmailQueue.js";
import { getEmailProvider, sendOTP } from "../config/helperfunction/userHelper.js";
import { mailaccesRealTime } from "../service/googleMail.js";
import crypto from "crypto";
import { createSubscription, getSubscriptionUserWise } from "../model/subscription.js";
import { mailAccessRealTimeOutlook } from "../service/hotMail.js";
import logger from "../utils/logger.js";
export const createController = async (req, res) => {
    try {
        const { userEmail, phoneNumber, organizationName, userName } = req.body;
        if (!userEmail || !phoneNumber) {
            return res.status(401).json({
                message: "Need userEmail or phonenumber",
                success: false
            });
        }
        const userData = await createUser({
            userEmail: userEmail,
            phoneNumber: phoneNumber,
            organizationName: organizationName,
            userName: userName
        });
        logger.info("User registered successfully", {
            type: "USER_CREATED",
            userId: userData?.id, // assuming createUser returns the id
            action: "createController",
            details: { userEmail, organizationName }
        });
        return res.status(200).json({
            message: "user registered success fully!",
            success: true,
            data: userData
        });
    }
    catch (error) {
        logger.error("Failed to register user", {
            type: "USER_CREATED",
            action: "createController",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return res.status(500).json({
            message: error?.message,
            success: false
        });
    }
};
export const sendOtpTouser = async (req, res) => {
    try {
        const { identifier } = req.body;
        if (!identifier) {
            return res.status(401).json({
                success: false,
                message: "gmail or phone number required"
            });
        }
        const checkUser = await getUserByMail(identifier);
        if (!checkUser) {
            return res.status(402).json({
                message: "User does not exist!",
                success: false
            });
        }
        const otp = sendOTP();
        const encryptedOTp = await bcrypt.hash(otp, 10);
        const futeureMinute = 10 * 60 * 1000;
        const otpExpireTimestamp = new Date(Date.now() + futeureMinute);
        await updatOTP(identifier, {
            otpCode: encryptedOTp || null,
            otpExpiresAt: otpExpireTimestamp || null
        });
        await sendOTPackGmailQueue.add("otp-sent", {
            type: "otp",
            to: checkUser?.userEmail,
            otp: otp
        }, {
            priority: 1
        });
        logger.info("OTP sent successfully", {
            type: "OTP_SENT",
            userId: checkUser.id,
            action: "sendOtpTouser",
            details: { identifier }
        });
        return res.json({
            message: "OTP has been sent to your mail",
            user: checkUser
        });
    }
    catch (error) {
        logger.error("Failed to send OTP", {
            type: "OTP_SENT",
            action: "sendOtpTouser",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return res.status(500).json({
            message: "error in signin",
            error: error.message
        });
    }
};
export const veriFyOTP = async (req, res) => {
    try {
        const { identifier } = req.params;
        const { otp } = req.body;
        if (!identifier) {
            return res.status(400).json({
                message: "required phone or email id",
                success: false
            });
        }
        const existingUser = await getUserByMail(identifier);
        if (!existingUser) {
            return res.status(401).json({
                message: "user does not exist",
                success: false
            });
        }
        const currentTimestamp = new Date();
        const existingOTimestamp = new Date(existingUser.otpExpiresAt);
        if (currentTimestamp > existingOTimestamp) {
            return res.status(402).json({
                message: "OTP is already Expire",
                success: false
            });
        }
        const compareOtp = await bcrypt.compare(otp, existingUser.otpCode);
        if (!compareOtp) {
            return res.status(403).json({
                message: "wrong OTP Entred",
                success: false
            });
        }
        const checkSubscription = await getSubscriptionUserWise(existingUser.id);
        if (!checkSubscription) {
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 1);
            await createSubscription({
                userId: existingUser.id,
                subscriptionStatus: true,
                endDate: futureDate,
                totalCredits: 150,
                usedCredits: 0,
                remainingCredits: 150,
                totalAmount: 300,
                paymentChild: [{
                        amount: 250,
                        paymentFlow: "IN",
                        paymentType: "FREE",
                        paymentStatus: "SUCCESS",
                        paymentMedium: "SYSTEM"
                    }, {
                        amount: 50,
                        paymentFlow: "IN",
                        paymentType: "FREE",
                        paymentStatus: "SUCCESS",
                        paymentMedium: "SYSTEM"
                    }],
                creditChild: [{
                        creditCount: 150,
                        creditFlow: "IN",
                        creditType: "FREE_CREDIT",
                        balanceBefore: 0,
                        balanceAfter: 150
                    }]
            });
            logger.info("Free subscription assigned on first login", {
                type: "FREE_SUBSCRIPTION_CREATED",
                userId: existingUser.id,
                action: "veriFyOTP",
                details: { totalCredits: 150 }
            });
        }
        const accessToken = await issueTokens(res, existingUser, crypto.randomUUID(), req);
        await deleteOTP(existingUser.id);
        const provider = getEmailProvider(existingUser.userEmail);
        try {
            if (existingUser.mailType === "gmail") {
                await mailaccesRealTime(existingUser.userEmail);
            }
            else if (existingUser.mailType === "outlook") {
                await mailAccessRealTimeOutlook(existingUser.userEmail);
            }
            else {
                logger.warn("No mail subscription available for provider", {
                    type: "MAIL_SUBSCRIPTION_WARNING",
                    userId: existingUser.id,
                    action: "veriFyOTP",
                    details: { provider }
                });
            }
        }
        catch (err) {
            logger.error("Mail subscription failed (non-blocking)", {
                type: "MAIL_SUBSCRIPTION_FAILED",
                userId: existingUser.id,
                action: "veriFyOTP",
                error: err instanceof Error ? err.message : String(err)
            });
        }
        logger.info("User signed in successfully", {
            type: "USER_SIGNIN",
            userId: existingUser.id,
            action: "veriFyOTP",
            details: { provider }
        });
        return res.json({
            message: "you have signIn successfully!",
            accessToken,
            user: { ...existingUser,
                isAdmin: existingUser.userChild?.isAdmin ? existingUser.userChild?.isAdmin : false }
        });
    }
    catch (error) {
        logger.error("Failed to verify OTP", {
            type: "OTP_VERIFICATION_FAILED",
            action: "veriFyOTP",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return res.status(500).json({
            message: "errorn in verify otp",
            success: false
        });
    }
};
export const logout = async (req, res) => {
    try {
        const raw = req.cookies?.[REFRESH_COOKIE];
        if (raw) {
            const known = await findHash(hashToken(raw));
            if (known)
                await revokeFamily(known.familyId, known.userId);
        }
        res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
        logger.info("User logged out successfully", {
            type: "USER_LOGOUT",
            userId: req.user?.id,
            action: "logout",
            details: { cookieCleared: true }
        });
        res.sendStatus(204);
    }
    catch (error) {
        logger.error("Failed to logout user", {
            type: "USER_LOGOUT",
            userId: req.user?.id,
            action: "logout",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return res.status(500).json({
            message: "error in logout",
            error: error.message
        });
    }
};
export const logoutAll = async (req, res) => {
    try {
        await revokeAllForUser(req.user.id);
        res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
        logger.info("User logged out from all devices", {
            type: "USER_LOGOUT_ALL",
            userId: req.user.id,
            action: "logoutAll",
            details: { allSessionsRevoked: true }
        });
        res.sendStatus(204);
    }
    catch (error) {
        logger.error("Failed to logout from all devices", {
            type: "USER_LOGOUT_ALL",
            userId: req.user?.id,
            action: "logoutAll",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return res.status(500).json({
            message: "Error in logout All",
            error: error?.message
        });
    }
};
export const sessions = async (req, res) => {
    try {
        const cookieToken = req.cookies?.rt;
        const activeSessions = await listSessions(cookieToken, req.user.id);
        console.log("here is the", req.user);
        logger.info("Sessions fetched successfully", {
            type: "GET_SESSIONS",
            userId: req.user.id,
            action: "sessions",
            details: { sessionCount: activeSessions?.length || 0 }
        });
        return res.json({
            sessions: activeSessions
        });
    }
    catch (error) {
        logger.error("Failed to fetch sessions", {
            type: "GET_SESSIONS",
            userId: req.user?.id,
            action: "sessions",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return res.status(500).json({
            message: "Error in session",
            error: error.message
        });
    }
};
export const deleteSession = async (req, res) => {
    try {
        const cookieToken = req.cookies?.rt;
        const owned = await listSessions(cookieToken, req.user.id);
        if (!owned?.some((s) => s.familyId === req.params.familyId)) {
            return res.status(404).json({
                error: "SESSION_NOT_FOUND"
            });
        }
        await revokeFamily(req.params.familyId, req.user.id);
        const raw = req.cookies?.[REFRESH_COOKIE];
        if (raw) {
            const current = await findHash(hashToken(raw));
            if (current?.familyId === req.params.familyId) {
                res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
            }
        }
        logger.info("Session deleted successfully", {
            type: "DELETE_SESSION",
            userId: req.user.id,
            action: "deleteSession",
            details: { familyId: req.params.familyId }
        });
        res.sendStatus(204);
    }
    catch (error) {
        logger.error("Failed to delete session", {
            type: "DELETE_SESSION",
            userId: req.user?.id,
            action: "deleteSession",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return res.status(500).json({
            message: "Error in delete session",
            error: error.message
        });
    }
};
export const userDetailsUpdateController = async (req, res) => {
    try {
        if (!req.user?.id) { // 👈 optional chaining lagao
            return res.status(401).json({
                message: "User does not exist",
                success: false,
            });
        }
        const updateData = req.body; // 👈 directly body le lo, destructure mat karo
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "No data provided to update",
                success: false,
            });
        }
        const updateUserDetails = await updatePersonalDetails(updateData, req.user.id);
        return res.status(200).json({
            message: "User personal details updated successfully!",
            success: true,
            data: updateUserDetails,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error in updating user personal details",
            success: false, // 👈 false hona chahiye
            error: error instanceof Error ? error.message : error,
        });
    }
};
export const deleteUserController = async (req, res) => {
    try {
        const { deleteInputText } = req.body;
        if (!req.user.id) {
            return res.status(401).json({
                message: "You are not authorized",
                success: false
            });
        }
        const getUser = await getUserByMail(req.user?.id);
        if (!getUser) {
            return res.status(404).json({
                message: "user does not exist",
                success: false
            });
        }
        await deleteUser(req.user?.id, deleteInputText);
        await sendOTPackGmailQueue.add("delete-user", {
            type: "deleteuser",
            to: getUser?.userEmail,
            userName: getUser?.userName
        }, {
            priority: 8
        });
        logger.info("User deleted mark successfully!", {
            type: "USER_DELETE",
            action: "delete user",
            email: getUser.userEmail
        });
        return res.status(200).json({
            message: "user mark deleted successfully!",
            success: true
        });
    }
    catch (error) {
        logger.error("Failed to mark deletd user", {
            type: "USER_DELETE",
            action: "delete user",
            email: error.message
        });
        return res.status(500).json({ error: "Failed to fetch user information" });
    }
};
export const deactivateUserController = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!req.user.id) {
            return res.status(401).json({
                message: "You are not authorized",
                success: false
            });
        }
        await deactivateUser(req.user?.id, reason);
        logger.info("User deactivate mark successfully!", {
            type: "USER_DEACTIVATE",
            action: "deactivate user",
            userId: req.user?.id
        });
        return res.status(200).json({
            message: "user mark deleted successfully!",
            success: true
        });
    }
    catch (error) {
        logger.error("Failed to mark deactivate user", {
            type: "USER_DEACTIVATE",
            action: "deactivate user",
            email: error.message
        });
        return res.status(500).json({ error: "Failed to fetch user information" });
    }
};
export const reactiveUserController = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!req.user?.id && !req.user.isAdmin) {
            return res.status(400).json({
                message: "you are not authorized",
                success: false
            });
        }
        await reactivateUser(userId);
        logger.info("User Active mark successfully!", {
            type: "USER_ACTIVATE",
            action: "Active user",
            userId: req.user?.id
        });
        return res.status(200).json({
            message: "User active now",
            success: true
        });
    }
    catch (error) {
        logger.error("Failed to mark active user", {
            type: "USER_ACTIVATE",
            action: "activate user",
            email: error.message
        });
    }
};
export const recoverUserController = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!req.user?.id && !req.user.isAdmin) {
            return res.status(400).json({
                message: "you are not authorized",
                success: false
            });
        }
        await recoverUser(userId);
        logger.info("recover User successfully!", {
            type: "RECOVER_USER",
            action: "recover user",
            userId: req.user?.id
        });
        return res.status(200).json({
            message: "user recover successfully!",
            success: true
        });
    }
    catch (error) {
        logger.error("Failed to mark active user", {
            type: "RECOVER_USER",
            action: "recover user",
            email: error.message
        });
    }
};
//# sourceMappingURL=userController.js.map