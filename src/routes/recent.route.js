import express from "express";

import { getRecentFilesController } from "../controller/recent.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getRecentFilesController);

export default router;