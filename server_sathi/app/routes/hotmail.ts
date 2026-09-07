import {Router} from "express";
import { callbackUrlMicrosoft, notification, redirectMicrosoft, stopUserWatch } from "../service/hotMail.js";

const router = Router();
router.get("/callback",callbackUrlMicrosoft);
router.get("/redirectMicrosoft", redirectMicrosoft);
router.post("/notification",notification);
router.get("/stopUserWatch", stopUserWatch)

export default router;