import express from "express";
import { createShare, deleteShare, getShare } from "../controller/share.controller.js";
import {authMiddleware} from '../middleware/auth.middleware.js';
const router = express.Router();
router.post("/", authMiddleware,createShare);
router.get('/:resourceType/:resourceId',authMiddleware,getShare);
router,delete("/:id",authMiddleware,deleteShare)
export default router;