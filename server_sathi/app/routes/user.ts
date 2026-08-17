import {Router} from "express";
import { loginLimiter } from "../config/limiter.js";
import { createController, deleteSession, logout, logoutAll, sendOtpTouser, sessions, veriFyOTP } from "../controller/userController.js";
import { requireAuth } from "../config/middleware.js";
import { refresh } from "../controller/refresherController.js";

const router = Router();

router.post("/register", loginLimiter, createController);
router.post("/sendOtp", loginLimiter, sendOtpTouser);
router.post("/verifyOtp/:identifier", loginLimiter, veriFyOTP)
router.post("/logout", logout);
router.post("/logout-all", requireAuth, logoutAll);
router.get("/sessions", requireAuth, sessions);
router.delete("/sessions/:familyId", requireAuth, deleteSession);
router.post("/refresh", refresh)

export default router;