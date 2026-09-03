import {Router} from "express";
import { createAdminController, loggedIn } from "../controller/adminController.js";

const router = Router();

router.post("/create", createAdminController);
router.post("/login", loggedIn);

export default router