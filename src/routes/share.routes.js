import express from "express";
import { createShare, getShare, getSharedWithMe, deleteShare } from "../controller/share.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();



router.get("/", authMiddleware, getSharedWithMe);



router.post("/", authMiddleware, createShare);



router.get("/:resourceType/:resourceId", authMiddleware, getShare);


router.delete("/:id", authMiddleware, deleteShare);

export default router;