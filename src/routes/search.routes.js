import express from "express";
import {searchController} from "../controller/search.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router = express.Router();
router.get("/",authMiddleware,searchController);
export default router;
