import {Router} from "express";
import { callbackUrlMicrosoft, notification, redirectMicrosoft } from "../service/hotMail.js";

const router = Router();
router.get("/callback",callbackUrlMicrosoft);
router.get("/redirectMicrosoft", redirectMicrosoft);
router.post("/notification",notification)

export default router;