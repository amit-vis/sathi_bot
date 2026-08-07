import {Router} from "express";
import { embbededSignup, whatsAppCallbackpost, whatsAppcallbackUrl } from "../service/whatsappweb.js";

const router = Router();

router.get("/callback", whatsAppcallbackUrl);
router.post("/callback",whatsAppCallbackpost );
router.post("/embedded-signup", embbededSignup);

export default router;