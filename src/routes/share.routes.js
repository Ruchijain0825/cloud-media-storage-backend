import express from "express";

import {
  createShare,
  getShare,
  getSharedWithMe,
  deleteShare,
} from "../controller/share.controller.js";

import {
  authMiddleware,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Shared WITH ME
router.get(
  "/",
  authMiddleware,
  getSharedWithMe
);

// Create share
router.post(
  "/",
  authMiddleware,
  createShare
);

// Get shares of specific resource
router.get(
  "/:resourceType/:resourceId",
  authMiddleware,
  getShare
);

// Revoke share
router.delete(
  "/:id",
  authMiddleware,
  deleteShare
);

export default router;