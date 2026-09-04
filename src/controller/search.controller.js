import { searchFilesAndFolders } from "../model/search.model.js";

export const searchController = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { q = "", page = 1, limit = 10 } = req.query;

    const searchText = q.trim();

    if (!searchText) {
      return res.status(200).json({
        success: true,
        files: [],
        folders: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
        },
      });
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(
      Math.max(Number(limit) || 10, 1),
      100
    );

    const offset = (pageNumber - 1) * limitNumber;

    const result = await searchFilesAndFolders({
      ownerId: userId,
      query: searchText,
      limit: limitNumber,
      offset,
    });

    return res.status(200).json({
      success: true,
      files: result.files,
      folders: result.folders,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Search error:", error);

    return res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};