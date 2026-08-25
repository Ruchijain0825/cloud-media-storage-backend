import express from "express";
import {authMiddleware} from "../middleware/auth.middleware.js";
import { createLinkShare } from "../controller/link.controller.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createLinkShare
);

export default router;