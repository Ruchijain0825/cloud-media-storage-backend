import pool from "../config/db.js";

export const getResourceRole = async ({
  resourceType,
  resourceId,
  userId
}) => {
  const table = resourceType === "file" ? "files" : "folders";


  const ownerResult = await pool.query(
    `SELECT owner_id
     FROM ${table}
     WHERE id = $1
     AND is_deleted = false`,
    [resourceId]
  );

  if (ownerResult.rows.length === 0) {
    return null;
  }

  const ownerId = ownerResult.rows[0].owner_id;


  if (ownerId === userId) {
    return "owner";
  }

 
  const shareResult = await pool.query(
    `SELECT role
     FROM shares
     WHERE resource_type = $1
     AND resource_id = $2
     AND grantee_user_id = $3`,
    [resourceType, resourceId, userId]
  );

  if (shareResult.rows.length === 0) {
    return null;
  }

  return shareResult.rows[0].role;
};