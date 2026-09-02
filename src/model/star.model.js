import pool from "../config/db.js";
import supabase from "../config/supabase.js";

export const getStarsModel = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      s.user_id,
      s.resource_type,
      s.resource_id,

      CASE
        WHEN s.resource_type = 'file'
        THEN f.name
        ELSE fo.name
      END AS name,

      CASE
        WHEN s.resource_type = 'file'
        THEN f.mime_type
        ELSE NULL
      END AS mime_type,

      CASE
        WHEN s.resource_type = 'file'
        THEN f.storage_key
        ELSE NULL
      END AS storage_key

    FROM stars s

    LEFT JOIN files f
      ON s.resource_type = 'file'
      AND s.resource_id = f.id

    LEFT JOIN folders fo
      ON s.resource_type = 'folder'
      AND s.resource_id = fo.id

    WHERE s.user_id = $1
      AND (
        s.resource_type = 'folder'
        OR (
          f.is_deleted = false
        )
      )

    ORDER BY name ASC
    `,
    [userId]
  );

  const stars = await Promise.all(
    result.rows.map(async (star) => {
      let url = null;

      if (
        star.resource_type === "file" &&
        star.storage_key
      ) {
        const { data } = supabase.storage
          .from(process.env.SUPABASE_STORAGE_BUCKET)
          .getPublicUrl(star.storage_key);

        url = data?.publicUrl || null;
      }

      return {
        ...star,
        url,
      };
    })
  );

  return stars;
};