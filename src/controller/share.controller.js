import pool from "../config/db.js";
import supabase from "../config/supabase.js";
import nodemailer from "nodemailer";
import { createShareModel, getShareModel, deleteShareModel, getSharedWithMeModel } from "../model/share.model.js";
import { findUserByEmail } from "../model/user.model.js";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    requireTLS: true,
});

export const createShare = async (req, res) => {
    try {
        const { resourceType, resourceId, email, role } = req.body;
        const ownerId = req.user.userId;

        if (!resourceType || !resourceId || !email || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!",
            });
        }

        if (!["file", "folder"].includes(resourceType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource type",
            });
        }

        if (!["viewer", "editor"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role",
            });
        }

        const table = resourceType === "file" ? "files" : "folders";

        const resource = await pool.query(`SELECT * FROM ${table} WHERE id = $1 AND owner_id = $2 AND is_deleted = false`, [resourceId, ownerId]);

        if (resource.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to share this resource",
            });
        }

        const user = await findUserByEmail(email);

        if (!user) {
            if (resourceType !== "file") {
                return res.status(400).json({
                    success: false,
                    message: "Guest sharing is currently available only for files",
                });
            }

            const file = resource.rows[0];

            if (!file.storage_key) {
                return res.status(500).json({
                    success: false,
                    message: "File storage information is not available",
                });
            }

            const { data } = supabase.storage.from(process.env.SUPABASE_STORAGE_BUCKET).getPublicUrl(file.storage_key);

            const fileUrl = data?.publicUrl;

            if (!fileUrl) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to generate file URL",
                });
            }

            const ownerResult = await pool.query(`SELECT email FROM users WHERE id = $1`, [ownerId]);

            const ownerEmail = ownerResult.rows[0]?.email || "Someone";

            await transporter.sendMail({
                from: `"Cloud Media" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "You received a file from Cloud Media",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #ffffff;">
                        <h2 style="color: #1f2937; margin-bottom: 10px;">
                            Cloud Media
                        </h2>

                        <p style="color: #4b5563; font-size: 16px;">
                            <strong>${ownerEmail}</strong> shared a file with you.
                        </p>

                        <div style="margin: 25px 0; padding: 18px; background: #f3f4f6; border-radius: 10px;">
                            <p style="margin: 0; color: #111827; font-size: 16px;">
                                📄 <strong>${file.name}</strong>
                            </p>
                        </div>

                        <a href="${fileUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
                            View File
                        </a>

                        <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">
                            You don't need a Cloud Media account to view this file.
                        </p>
                    </div>
                `,
            });

            return res.status(200).json({
                success: true,
                message: "File link sent successfully to the email address",
                guest: true,
            });
        }

        const granteeUserId = user.id;

        if (ownerId === granteeUserId) {
            return res.status(400).json({
                success: false,
                message: "You can't share with yourself",
            });
        }

        const share = await createShareModel({
            resourceType,
            resourceId,
            granteeUserId,
            role,
            createdBy: ownerId,
        });

        return res.status(201).json({
            success: true,
            message: "Resource shared successfully",
            share,
        });
    } catch (error) {
        console.error("Create share error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const getShare = async (req, res) => {
    try {
        const { resourceType, resourceId } = req.params;

        if (!resourceType || !resourceId) {
            return res.status(400).json({
                success: false,
                message: "Fields not found!",
            });
        }

        const shares = await getShareModel({
            resourceId,
            resourceType,
        });

        return res.status(200).json({
            success: true,
            shares,
        });
    } catch (error) {
        console.error("Get shares error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const getSharedWithMe = async (req, res) => {
    try {
        const userId = req.user.userId;
        const shares = await getSharedWithMeModel(userId);

        const updatedShares = shares.map((share) => {
            let url = null;

            if (share.resource_type === "file" && share.storage_key) {
                const { data } = supabase.storage.from(process.env.SUPABASE_STORAGE_BUCKET).getPublicUrl(share.storage_key);
                url = data.publicUrl;
            }

            return {
                ...share,
                url,
            };
        });

        return res.status(200).json({
            success: true,
            shares: updatedShares,
        });
    } catch (error) {
        console.error("Get shared with me error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch shared resources",
        });
    }
};

export const deleteShare = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Share ID is required",
            });
        }

        const deletedShare = await deleteShareModel(id);

        if (!deletedShare) {
            return res.status(404).json({
                success: false,
                message: "Share ID not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Share revoked successfully!",
            share: deletedShare,
        });
    } catch (error) {
        console.error("Share deletion error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};