import { createFolder, getFolderById, getChildFolder, updateFolder, deleteFolder, getRootFolders } from "../model/folder.model.js";
import { getRootFiles, getFilesByFolder } from "../model/file.model.js";
import { hasPermission } from "../model/permission.model.js";

export const createFolderController = async (req, res) => {
  try {
    const { name, parentId = null } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Folder name is required",
      });
    }

    const ownerId = req.user.userId;

    const folder = await createFolder({
      name,
      ownerId,
      parentId,
    });

    return res.status(201).json({
      success: true,
      message: "Folder created successfully",
      folder,
    });
  } catch (error) {
    console.error("Create folder error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRootFoldersController = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const folders = await getRootFolders({
      ownerId,
    });

    const files = await getRootFiles({
      ownerId,
    });

    return res.status(200).json({
      success: true,
      folders,
      files,
    });
  } catch (error) {
    console.error(
      "Error accessing root folders:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getFolderController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const permission = await hasPermission({
      resourceType: "folder",
      resourceId: id,
      userId,
      requiredRole: "viewer",
    });

    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this folder",
      });
    }

    const folder = await getFolderById({
      folderId: id,
      ownerId: userId,
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found",
      });
    }

    return res.status(200).json({
      success: true,
      folder,
      permission: permission.role,
    });
  } catch (error) {
    console.error(
      "Error accessing folder:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getChildFolderController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const permission = await hasPermission({
      resourceType: "folder",
      resourceId: id,
      userId,
      requiredRole: "viewer",
    });

    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this folder",
      });
    }

    const folder = await getFolderById({
      folderId: id,
      ownerId: userId,
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found",
      });
    }

    const childFolder = await getChildFolder({
      parentId: id,
      ownerId: userId,
    });

    const files = await getFilesByFolder({
      folderId: id,
      ownerId: userId,
    });

    return res.status(200).json({
      success: true,
      folder,
      permission: permission.role,
      children: {
        folders: childFolder,
        files,
      },
    });
  } catch (error) {
    console.error(
      "Error accessing folders:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateFolderController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;

    const userId = req.user.userId;

    if (!name && parentId === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name or parentId is required",
      });
    }

    const permission = await hasPermission({
      resourceType: "folder",
      resourceId: id,
      userId,
      requiredRole: "viewer",
    });

    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message: "You need editor permission to update this folder",
      });
    }

    const folder = await updateFolder({
      folderId: id,
      ownerId: userId,
      name,
      parentId,
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Folder updated successfully",
      folder,
      permission: permission.role,
    });
  } catch (error) {
    console.error(
      "Update folder error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteFolderController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const permission = await hasPermission({
      resourceType: "folder",
      resourceId: id,
      userId,
      requiredRole: "editor",
    });

    if (!permission.allowed || permission.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only the owner can delete this folder",
      });
    }

    const folder = await deleteFolder({
      folderId: id,
      ownerId: userId,
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Folder deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete folder error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};