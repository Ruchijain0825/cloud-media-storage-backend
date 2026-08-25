import express from "express";
import {authMiddleware} from "../middleware/auth.middleware.js";
import { resolveLinkShare} from "../controller/publicshare.controller.js";

const router = express.Router();

router.get(
  "/:token",
  authMiddleware,
  resolveLinkShare
);

export default router;