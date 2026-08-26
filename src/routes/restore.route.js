import express from "express";
import { restoreFromTrash } from "../controller/trash.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router = express.Router();
router.post("/restore",authMiddleware,restoreFromTrash);
export default router;