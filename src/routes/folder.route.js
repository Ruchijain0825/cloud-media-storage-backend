import express from "express";
import { createFolderController,getFolderController,getChildFolderController, updateFolderController, deleteFolderController,getRootFoldersController } from "../controller/folder.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/",authMiddleware,createFolderController);
router.get("/root", authMiddleware, getRootFoldersController);
router.get("/:id",authMiddleware,getFolderController);
router.get("/:id/children",authMiddleware,getChildFolderController)
router.patch("/:id",authMiddleware,updateFolderController)
router.delete("/:id",authMiddleware,deleteFolderController)
export default router;
