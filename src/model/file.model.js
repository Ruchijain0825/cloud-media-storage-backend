import pool from "../config/db.js";
import supabase from "../config/supabase.js";

const getSignedFileUrl = async (storageKey) => {
  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET)
    .createSignedUrl(storageKey, 60 * 60);

  if (error) {
    console.error("Signed URL error:", error);
    return null;
  }

  return data?.signedUrl || null;
};

export const getRootFiles = async ({ ownerId }) => {
  const result = await pool.query(
    `SELECT *
     FROM files
     WHERE owner_id = $1
       AND folder_id IS NULL
       AND is_deleted = false
     ORDER BY name ASC`,
    [ownerId]
  );

  const files = await Promise.all(
    result.rows.map(async (file) => {
      const url = await getSignedFileUrl(
        file.storage_key
      );

      return {
        ...file,
        url,
      };
    })
  );

  return files;
};

export const getFilesByFolder = async ({
  folderId,
  ownerId,
}) => {
  const result = await pool.query(
    `SELECT *
     FROM files
     WHERE folder_id = $1
       AND owner_id = $2
       AND is_deleted = false
     ORDER BY name ASC`,
    [folderId, ownerId]
  );

  const files = await Promise.all(
    result.rows.map(async (file) => {
      const url = await getSignedFileUrl(
        file.storage_key
      );

      return {
        ...file,
        url,
      };
    })
  );

  return files;
};