import pool from "../config/db.js";
import supabase from "../config/supabase.js";

const getSignedFileUrl = async (storageKey) => {
    if (!storageKey) {
        return null;
    }

    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_STORAGE_BUCKET)
        .createSignedUrl(storageKey, 60 * 60);

    if (error) {
        console.error("Signed URL error:", error);
        return null;
    }

    return data?.signedUrl || null;
};

export const searchFilesAndFolders = async ({ ownerId, query, limit, offset }) => {
    const searchPattern = `%${query}%`;

    const filesResult = await pool.query(`SELECT * FROM files WHERE owner_id = $1 AND is_deleted = false AND name ILIKE $2 ORDER BY name ASC LIMIT $3 OFFSET $4`, [ownerId, searchPattern, limit, offset]);

    const foldersResult = await pool.query(`SELECT * FROM folders WHERE owner_id = $1 AND name ILIKE $2 ORDER BY name ASC LIMIT $3 OFFSET $4`, [ownerId, searchPattern, limit, offset]);

    const files = await Promise.all(
        filesResult.rows.map(async (file) => {
            const url = await getSignedFileUrl(file.storage_key);

            return {
                ...file,
                url,
            };
        })
    );

    return {
        files,
        folders: foldersResult.rows,
    };
};