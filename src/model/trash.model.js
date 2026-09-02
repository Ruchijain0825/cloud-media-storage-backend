import pool from "../config/db.js";

export const getTrashModel = async (userId) => {
  const result = await pool.query(`
    SELECT id, name, 'file' AS resource_type, mime_type, size_bytes, owner_id, folder_id, updated_at
    FROM files
    WHERE owner_id = $1 AND is_deleted = true

    UNION ALL

    SELECT id, name, 'folder' AS resource_type, NULL AS mime_type, NULL AS size_bytes, owner_id, parent_id AS folder_id, updated_at
    FROM folders
    WHERE owner_id = $1 AND is_deleted = true

    ORDER BY updated_at DESC
  `, [userId]);

  return result.rows;
};