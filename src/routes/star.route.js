import express from "express";
import { addStar,removeStar,getStars } from "../controller/star.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router = express.Router();
router.get("/", authMiddleware, getStars);
router.post("/",authMiddleware,addStar);
router.delete("/", authMiddleware, removeStar);
export default router;