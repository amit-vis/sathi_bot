import {Router} from "express";
import gemailserviceRoutes from "./gmailservice.js"

const router = Router();

router.use("/gmail", gemailserviceRoutes);


export default router;