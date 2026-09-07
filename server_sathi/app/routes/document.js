import { Router } from "express";
import { downloadDocumentsExcel, getDocumentByIdController, getUserDocumentController } from "../controller/documentController.js";
import { requireAuth } from "../config/middleware.js";
const router = Router();
router.get("/list", requireAuth, getUserDocumentController);
router.get("/download/excel", requireAuth, downloadDocumentsExcel);
router.get("/:documentId", requireAuth, getDocumentByIdController);
export default router;
//# sourceMappingURL=document.js.map