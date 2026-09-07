import { Router } from "express";
import gemailserviceRoutes from "./gmailservice.js";
import userRoutes from "./user.js";
import wabaRoutes from "./whatsapp.js";
import hotmailRoutes from "./hotmail.js";
import subscriptionRoutes from "./subscription.js";
import documentRoutes from "./document.js";
import adminRoutes from "./admin.js";
const router = Router();
router.use("/gmail", gemailserviceRoutes);
router.use("/user", userRoutes);
router.use("/whatsapp", wabaRoutes);
router.use("/hotmail", hotmailRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/document", documentRoutes);
router.use("/admin", adminRoutes);
export default router;
//# sourceMappingURL=index.js.map