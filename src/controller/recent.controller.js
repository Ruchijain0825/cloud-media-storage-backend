import { getRecentFiles } from "../model/file.model.js";

export const getRecentFilesController = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const files = await getRecentFiles({
      ownerId,
    });

    return res.status(200).json({
      success: true,
      files,
    });
  } catch (error) {
    console.error("Get recent files error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get recent files",
    });
  }
};