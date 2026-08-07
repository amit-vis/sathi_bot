import {Router} from "express";
import { callbackUrlMicrosoft, redirectMicrosoft } from "../service/hotMail.js";

const router = Router();
router.get("/callback",callbackUrlMicrosoft);
router.get("/redirectMicrosoft", redirectMicrosoft)

export default router;