import { Router } from "express";
import { getAllSubscriptionController, handleSubscription, userWiseCreditController } from "../controller/subscriptionController.js";
import { requireAuth } from "../config/middleware.js";
const router = Router();
router.get(`/getAllSubscriptionController`, getAllSubscriptionController);
router.get(`/userWiseCreditController`, requireAuth, userWiseCreditController);
router.post("/handleSubscription", requireAuth, handleSubscription);
export default router;
//# sourceMappingURL=subscription.js.map