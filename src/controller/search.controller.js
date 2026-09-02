import pool from "../config/db.js";

export const searchController = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!q || q.trim() === "") {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    if (!Number.isInteger(pageNumber) || pageNumber < 1 || !Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      return res.status(400).json({ success: false, message: "Invalid page or limit" });
    }

    const offset = (pageNumber - 1) * limitNumber;
    const searchQuery = q.trim();

    const files = await pool.query(
      `SELECT id, name, mime_type, size_bytes, folder_id, created_at
       FROM files
       WHERE owner_id = $1 AND is_deleted = false
       AND to_tsvector('simple', name) @@ plainto_tsquery('simple', $2)
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [userId, searchQuery, limitNumber, offset]
    );

    const folders = await pool.query(
      `SELECT id, name, parent_id, created_at
       FROM folders
       WHERE owner_id = $1 AND is_deleted = false
       AND to_tsvector('simple', name) @@ plainto_tsquery('simple', $2)
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [userId, searchQuery, limitNumber, offset]
    );

    const filecount = await pool.query(
      `SELECT COUNT(*) FROM files
       WHERE owner_id = $1 AND is_deleted = false
       AND to_tsvector('simple', name) @@ plainto_tsquery('simple', $2)`,
      [userId, searchQuery]
    );

    const folderCount = await pool.query(
      `SELECT COUNT(*) FROM folders
       WHERE owner_id = $1 AND is_deleted = false
       AND to_tsvector('simple', name) @@ plainto_tsquery('simple', $2)`,
      [userId, searchQuery]
    );

    const totalFileCount = Number(filecount.rows[0].count);
    const totalFolderCount = Number(folderCount.rows[0].count);
    const totalCount = totalFileCount + totalFolderCount;
    const hasNextPage = pageNumber * limitNumber < totalCount;

    return res.status(200).json({
      success: true,
      data: { files: files.rows, folders: folders.rows },
      pagination: { page: pageNumber, limit: limitNumber, totalCount, hasNextPage },
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ success: false, message: "Search failed" });
  }
};