import {Router} from "express";
import gemailserviceRoutes from "./gmailservice.js";
import userRoutes from "./user.js";
import wabaRoutes from "./whatsapp.js";
import hotmailRoutes from "./hotmail.js";

const router = Router();

router.use("/gmail", gemailserviceRoutes);
router.use("/user", userRoutes);
router.use("/whatsapp", wabaRoutes);
router.use("/hotmail", hotmailRoutes);

export default router;