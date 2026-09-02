import express from "express";
import { restoreFromTrash,getTrash } from "../controller/trash.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router = express.Router();
router.get(
  "/",
  authMiddleware,
  getTrash
);
router.post("/restore",authMiddleware,restoreFromTrash);
export default router;