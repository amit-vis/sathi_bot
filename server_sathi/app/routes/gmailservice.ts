import {Router} from "express";
import { getLabels, mailaccesRealTime, notification, redirecTGmail} from "../service/googleMail.js"
import { requireAuth } from "../config/middleware.js";
const router = Router();


router.post("/newNotification", notification);
router.get("/redirecTGmail", redirecTGmail);
router.get("/getLabels", getLabels)

export default router;