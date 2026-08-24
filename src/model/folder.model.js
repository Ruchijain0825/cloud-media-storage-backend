import pool from '../config/db.js';
export const createFolder = async({name,ownerId,parentId})=>
{
    const result = await pool.query(`INSERT INTO folders(name,owner_id,parent_id) VALUES ($1,$2,$3) RETURNING*`,[name,ownerId,parentId])

    return result.rows[0]
}
export const getFolderById = async({folderId,ownerId})=>
{
    const result = await pool.query(`SELECT * FROM folders where id = $1 AND  owner_id = $2 AND is_deleted = false`,[folderId,ownerId])

    return result.rows[0]
}
export const getChildFolder = async({parentId,ownerId})=>
{
    const result = await pool.query(
        `SELECT * FROM folders WHERE parent_id = $1 AND  owner_id= $2 AND is_deleted = false ORDER BY name ASC`,[parentId,ownerId]
    )
    return result.rows;
}
export const updateFolder = async ({
    folderId,
    ownerId,
    name,
    parentId
}) => {
    const result = await pool.query(
        `UPDATE folders
         SET name = COALESCE($1, name),
             parent_id = COALESCE($2, parent_id),
             updated_at = now()
         WHERE id = $3
         AND owner_id = $4
         AND is_deleted = false
         RETURNING *`,
        [name, parentId, folderId, ownerId]
    );

    return result.rows[0];
};
export const deleteFolder = async({
    folderId,ownerId
})=>
{
    const result = await pool.query(
        `UPDATE folders SET is_deleted = true,updated_at=now() WHERE id = $1 AND owner_id = $2 AND is_deleted = false RETURNING * `,[folderId,ownerId]
    )
    return result.rows[0]
}