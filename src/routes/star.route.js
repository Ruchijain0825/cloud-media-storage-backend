import express from "express";
import { addStar,removeStar } from "../controller/star.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router = express.Router();
router.post("/",authMiddleware,addStar);
router.delete("/", authMiddleware, removeStar);
export default router;