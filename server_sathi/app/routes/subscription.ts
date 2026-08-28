import {Router} from "express";
import {getAllSubscriptionController, userWiseCreditController} from "../controller/subscriptionController.js"
import { requireAuth } from "../config/middleware.js";

const router = Router();

router.get(`/getAllSubscriptionController`, getAllSubscriptionController);
router.get(`/userWiseCreditController`,requireAuth, userWiseCreditController)


export default router;