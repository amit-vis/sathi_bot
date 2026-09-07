import { Router } from "express";
import { createAdminController, getUsers, getUserSubscription, loggedIn } from "../controller/adminController.js";
import { requireAuth } from "../config/middleware.js";
const router = Router();
router.post("/create", createAdminController);
router.post("/login", loggedIn);
router.get("/users", requireAuth, getUsers);
router.get("/users/:userId/subscription", requireAuth, getUserSubscription);
export default router;
//# sourceMappingURL=admin.js.map