import pool from "../config/db.js";

export const createShareModel = async ({ resourceType, resourceId, granteeUserId, role, createdBy }) => {
    const result = await pool.query(`INSERT INTO shares(resource_type,resource_id,grantee_user_id,role,created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *`
      ,[resourceType,resourceId,granteeUserId,role,createdBy])

    return result.rows[0];
}

export const getShareModel = async ({ resourceType, resourceId }) => {
    const result = await pool.query(`SELECT * FROM shares WHERE resource_type = $1 AND resource_id = $2 ORDER BY created_at DESC`
      ,[resourceType,resourceId])

    return result.rows;
}

export const getSharedWithMeModel = async (userId) => {
    const result = await pool.query(`SELECT s.id,s.resource_type,s.resource_id,s.grantee_user_id,s.role,
      s.created_by,s.created_at,CASE WHEN s.resource_type = 'file' THEN f.name ELSE fo.name END AS name,
      CASE WHEN s.resource_type = 'file' THEN f.mime_type ELSE NULL END AS mime_type,
      CASE WHEN s.resource_type = 'file' THEN f.size_bytes ELSE NULL END AS size_bytes,
      CASE WHEN s.resource_type = 'file' THEN f.storage_key ELSE NULL END AS storage_key FROM shares s 
      LEFT JOIN files f ON s.resource_type = 'file' AND s.resource_id = f.id LEFT JOIN folders fo ON s.resource_type = 'folder' AND s.resource_id = fo.id WHERE s.grantee_user_id = $1 ORDER BY s.created_at DESC`,[userId])

    return result.rows;
}

export const deleteShareModel = async (shareId) => {
    const result = await pool.query(`DELETE FROM shares WHERE id = $1 RETURNING *`,[shareId])

    return result.rows[0];
}