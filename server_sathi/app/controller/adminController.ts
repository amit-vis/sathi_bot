import bcrypt from "bcryptjs";
import { createAdmin } from "../model/admin.js";
import logger from "../utils/logger.js";
import { getUserByMail } from "../model/user.js";
import { issueTokens } from "./refresherController.js";
import crypto from "crypto";

export const createAdminController = async (req: any, res: any) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const encryptedPassword = await bcrypt.hash(password, 10);
        const data = await createAdmin({userName: name, userEmail: email, password: encryptedPassword });
        logger.info("admin registered successfully", {
            type: "ADMIN_CREATED",
            email: email, // assuming createUser returns the id
            action: "createController",
            details: { email, name }
        });
        return res.status(200).json({ message: "Admin created successfully", data });
    } catch (error) {
        logger.error("Failed to register admin", {
            type: "ADMIN_CREATED",
            action: "createController",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        res.status(500).json({ message: "Error creating admin" });
    }
}

export const loggedIn = async (req: any, res: any) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        // Add logic to find admin by email and verify password
        const getUser = await getUserByMail(email);
        if(!getUser) {
            return res.status(404).json({ message: "Admin not found" });
        }
        const isMatch = await bcrypt.compare(password, getUser.userChild?.password!);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const acessToken = await issueTokens(res, getUser, crypto.randomUUID(), req);
        logger.info("Admin logged in successfully", {
            type: "ADMIN_LOGGED_IN",
            email: email,
            action: "loggedIn"
        });
        return res.status(200).json({ message: "Admin logged in successfully", acessToken });
    } catch (error) {
        logger.error("Failed to log in admin", {
            type: "ADMIN_LOGGED_IN",
            action: "loggedIn",
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        res.status(500).json({ message: "Error logging in admin" });
    }
}