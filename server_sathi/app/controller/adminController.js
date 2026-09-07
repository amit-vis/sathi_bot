import bcrypt from "bcryptjs";
import { createAdmin, getUserSubscriptionDetail, getUsersWithSubscription } from "../model/admin.js";
import logger from "../utils/logger.js";
import { getUserByMail } from "../model/user.js";
import { issueTokens } from "./refresherController.js";
import crypto from "crypto";
export const createAdminController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const encryptedPassword = await bcrypt.hash(password, 10);
        const data = await createAdmin({ userName: name, userEmail: email, password: encryptedPassword });
        logger.info("admin registered successfully", {
            type: "ADMIN_CREATED",
            email: email, // assuming createUser returns the id
            action: "createController",
            details: { email, name }
        });
        return res.status(200).json({ message: "Admin created successfully", data });
    }
    catch (error) {
        console.error(error);
        logger.error("Failed to register admin", {
            type: "ADMIN_CREATED",
            action: "createController",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        res.status(500).json({ message: "Error creating admin" });
    }
};
export const loggedIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        // Add logic to find admin by email and verify password
        const getUser = await getUserByMail(email);
        if (!getUser) {
            return res.status(404).json({ message: "Admin not found" });
        }
        const isMatch = await bcrypt.compare(password, getUser.userChild?.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const accessToken = await issueTokens(res, getUser, crypto.randomUUID(), req);
        logger.info("Admin logged in successfully", {
            type: "ADMIN_LOGGED_IN",
            email: email,
            action: "loggedIn"
        });
        return res.status(200).json({ message: "Admin logged in successfully",
            accessToken,
            user: { ...getUser, isAdmin: getUser.userChild?.isAdmin } });
    }
    catch (error) {
        console.error(error);
        logger.error("Failed to log in admin", {
            type: "ADMIN_LOGGED_IN",
            action: "loggedIn",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        res.status(500).json({ message: "Error logging in admin" });
    }
};
// GET /admin/users?page=1&limit=10&search=john&status=active
export const getUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const search = req.query.search;
        const status = req.query.status;
        // Validate status
        const validStatuses = ["active", "inactive", "expiring"];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Use: ${validStatuses.join(", ")}`,
            });
        }
        if (!req.user?.id && !req.user?.isAdmin) {
            return res.status(401).json({ message: "you are not authorized" });
        }
        const result = await getUsersWithSubscription({ page, limit, search, status });
        logger.info("Admin fetched users list", {
            type: "ADMIN_FETCH_USERS",
            action: "getUsers",
            details: {
                page,
                limit,
                search: search || null,
                status: status || null,
                totalResults: result.pagination.totalUsers,
            },
        });
        return res.status(200).json(result);
    }
    catch (error) {
        logger.error("Failed to fetch users", {
            type: "ADMIN_FETCH_USERS_ERROR",
            action: "getUsers",
            error: error.message,
            stack: error.stack,
        });
        return res.status(500).json({
            message: "Failed to fetch users",
            error: error.message,
        });
    }
};
// GET /admin/users/:userId/subscription
export const getUserSubscription = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!req.user?.id && !req.user.isAdmin) {
            return res.status(401).json({ message: "you are not authorized" });
        }
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }
        const user = await getUserSubscriptionDetail(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        logger.info("Admin fetched user subscription detail", {
            type: "ADMIN_FETCH_USER_SUB",
            action: "getUserSubscription",
            details: { userId },
        });
        return res.status(200).json({
            user: {
                id: user.id,
                userName: user.userName,
                userEmail: user.userEmail,
                userPhone: user.userMobileNumber,
                createdAt: user.createdAt,
            },
            subscription: user.subscriptions || null,
        });
    }
    catch (error) {
        logger.error("Failed to fetch user subscription", {
            type: "ADMIN_FETCH_USER_SUB_ERROR",
            action: "getUserSubscription",
            error: error.message,
            stack: error.stack,
        });
        return res.status(500).json({
            message: "Failed to fetch subscription details",
            error: error.message,
        });
    }
};
//# sourceMappingURL=adminController.js.map