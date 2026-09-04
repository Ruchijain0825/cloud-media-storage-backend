import pool from "../config/db.js";

export const createLinkShareModel = async ({ resourceType, resourceId, token, role, passwordHash, expiresAt, createdBy }) => {
    const result = await pool.query(`INSERT INTO link_shares(resource_type, resource_id, token, role, 
      password_hash, expires_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, 
       [resourceType, resourceId, token, role, passwordHash, expiresAt, createdBy]);

    return result.rows[0];
};