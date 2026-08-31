import {Router} from "express";
import { getDocumentByIdController, getUserDocumentController } from "../controller/documentController.js";
import { requireAuth } from "../config/middleware.js";

const router = Router();

router.get("/list", requireAuth, getUserDocumentController);
router.get("/:documentId", requireAuth, getDocumentByIdController);

export default router