import bcrypt from "bcrypt";
import pool from "../config/db.js";
import supabase from "../config/supabase.js";
import { getLinkShareByTokenModel } from "../model/publicshare.model.js";

export const resolveLinkShare = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body||{}


    const linkshare = await getLinkShareByTokenModel(token);

    if (!linkshare) {
      return res.status(404).json({
        success: false,
        message: "Invalid share link"
      });
    }

 
    if (
      linkshare.expires_at &&
      new Date(linkshare.expires_at) < new Date()
    ) {
      return res.status(410).json({
        success: false,
        message: "Share link has expired"
      });
    }

    
    if (linkshare.password_hash) {
      if (!password) {
        return res.status(401).json({
          success: false,
          message: "Password required"
        });
      }

      const isValid = await bcrypt.compare(
        password,
        linkshare.password_hash
      );

      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid password"
        });
      }
    }


    const fileResult = await pool.query(
      `SELECT id, name, storage_key, mime_type
       FROM files
       WHERE id = $1
       AND is_deleted = false`,
      [linkshare.resource_id]
    );

    if (fileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }

    const file = fileResult.rows[0];

  
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET)
      .createSignedUrl(file.storage_key, 600);

    if (error) {
      console.error("Signed URL error:", error);

      return res.status(500).json({
        success: false,
        message: "Signed URL generate nahi hua"
      });
    }
    return res.status(200).json({
      success: true,
      fileName: file.name,
      mimeType: file.mime_type,
      signedUrl: data.signedUrl,
      role: linkshare.role
    });

  } catch (error) {
    console.error("Resolve link error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};