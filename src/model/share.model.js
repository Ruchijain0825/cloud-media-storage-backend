import pool from "../config/db.js";

export const createShareModel = async ({
  resourceType,
  resourceId,
  granteeUserId,
  role,
  createdBy
}) => {
  const result = await pool.query(
    `INSERT INTO shares
    (resource_type, resource_id, grantee_user_id, role, created_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [resourceType, resourceId, granteeUserId, role, createdBy]
  );

  return result.rows[0];
};
export const getShareModel = async({resourceType,resourceId})=>
{
    const result = await pool.query(`SELECT * from  shares WHERE resource_type = $1 AND resource_id = $2 ORDER BY created_at DESC`,[resourceType,resourceId] )

    return result.rows
}
export const deleteShareModel = async(shareId)=>
{
    const result = await pool.query(`SELECT * FROM  shares WHERE id  = $1 RETURNING * `,[shareId])
    return result.rows[0]
}