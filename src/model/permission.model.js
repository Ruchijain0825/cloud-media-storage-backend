import pool from "../config/db.js";

export const isOwner = async ({ resourceType, resourceId, userId }) => {
    const table = resourceType === "file" ? "files" : "folders";

    const result = await pool.query(`SELECT id FROM ${table} WHERE id = $1 AND owner_id = $2 AND is_deleted = false`, [resourceId, userId]);

    return result.rowCount > 0;
};

export const getSharedPermission = async ({ resourceType, resourceId, userId }) => {
    const result = await pool.query(`SELECT role FROM shares WHERE resource_type = $1 AND resource_id = $2 AND grantee_user_id = $3`, [resourceType, resourceId, userId]);

    if (result.rowCount === 0) {
        return null;
    }

    return result.rows[0].role;
};

export const hasPermission = async ({ resourceType, resourceId, userId, requiredRole = "viewer" }) => {
    const owner = await isOwner({ resourceType, resourceId, userId });

    if (owner) {
        return {
            allowed: true,
            role: "owner",
        };
    }

    const role = await getSharedPermission({ resourceType, resourceId, userId });

    if (!role) {
        return {
            allowed: false,
            role: null,
        };
    }

    if (requiredRole === "viewer") {
        return {
            allowed: true,
            role,
        };
    }

    if (requiredRole === "editor" && role === "editor") {
        return {
            allowed: true,
            role,
        };
    }

    return {
        allowed: false,
        role,
    };
};