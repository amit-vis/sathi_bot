import {Router} from "express";
import gemailserviceRoutes from "./gmailservice.js";
import userRoutes from "./user.js";

const router = Router();

router.use("/gmail", gemailserviceRoutes);
router.use("/user", userRoutes)

export default router;