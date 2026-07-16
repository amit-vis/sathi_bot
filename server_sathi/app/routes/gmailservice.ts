import {Router} from "express";
import { getLabels, mailaccesRealTime, notification, redirecTGmail} from "../service/googleMail.js"
const router = Router();

router.get("/gmailRedirect", mailaccesRealTime);
router.post("/newNotification", notification);
router.get("/redirecTGmail", redirecTGmail);
router.get("/getLabels", getLabels)

export default router;