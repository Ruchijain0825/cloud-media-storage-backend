import pool from "../config/db.js";
import { getStarsModel } from "../model/star.model.js";


// =====================================================
// ADD STAR
// =====================================================

export const addStar = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.body;
    const userId = req.user.userId;

    if (!resourceType || !resourceId) {
      return res.status(400).json({
        success: false,
        message: "resourceType and resourceId are required",
      });
    }

    if (!["file", "folder"].includes(resourceType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resourceType",
      });
    }

    const table =
      resourceType === "file"
        ? "files"
        : "folders";

    const resource = await pool.query(
      `
      SELECT id
      FROM ${table}
      WHERE id = $1
      AND owner_id = $2
      AND is_deleted = false
      `,
      [resourceId, userId]
    );

    if (resource.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "resource not found",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO stars(
        user_id,
        resource_type,
        resource_id
      )
      VALUES($1, $2, $3)
      ON CONFLICT(
        user_id,
        resource_type,
        resource_id
      )
      DO NOTHING
      RETURNING *
      `,
      [
        userId,
        resourceType,
        resourceId,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Resource starred successfully",
      star: result.rows[0] || null,
    });

  } catch (error) {
    console.error("Add star error:", error);

    return res.status(500).json({
      success: false,
      message: "failed to star resource",
    });
  }
};


// =====================================================
// REMOVE STAR
// =====================================================

export const removeStar = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.body;
    const userId = req.user.userId;

    if (!resourceType || !resourceId) {
      return res.status(400).json({
        success: false,
        message: "resourceType and resourceId are required",
      });
    }

    if (!["file", "folder"].includes(resourceType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resourceType",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM stars
      WHERE user_id = $1
      AND resource_type = $2
      AND resource_id = $3
      RETURNING *
      `,
      [
        userId,
        resourceType,
        resourceId,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Star not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resource unstarred successfully",
      star: result.rows[0],
    });

  } catch (error) {
    console.error("Remove star error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove star",
    });
  }
};


// =====================================================
// GET STARS
// =====================================================

export const getStars = async (req, res) => {
  try {
    const userId = req.user.userId;

    const stars = await getStarsModel(userId);

    return res.status(200).json({
      success: true,
      stars,
    });

  } catch (error) {
    console.error("Get stars error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch starred resources",
    });
  }
};