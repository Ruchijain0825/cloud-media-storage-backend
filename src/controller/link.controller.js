import crypto from "crypto";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { createLinkShareModel } from "../model/linkshare.model.js";

export const createLinkShare = async(req,res)=>
{
    try{
        const{resourceType,resourceId,expiresAt,password}=req.body;
        const userId = req.user.userId;
        if(!resourceType||!resourceId)
        {
            return res.status(400).json({success:false,message:"Resource type and Resource Id are required"})
        }
        if(!["file","folder"].includes(resourceType))
        {
            return res.status(400).json({success:false,message:"invalid resource type"})
        }
        const table = resourceType==="file"?"files":"folders";

        const resourceResult = await pool.query(`SELECT id FROM ${table} WHERE id = $1 AND owner_id = $2 AND is_deleted = false`,[resourceId,userId])

        if(resourceResult.rows.length===0)
        {
            return res.status(403).json({success:false,message:"you don't have permission to create this link "})

        }
        const token = crypto.randomBytes(32).toString("hex");
        let passwordHash = null;
        if(password)
        {
            passwordHash=await bcrypt.hash(password,10)

        }
        const role ="viewer";
        const linkShare = await createLinkShareModel({resourceType,resourceId,token,role,passwordHash,expiresAt:expiresAt||null,createdBy:userId})

        return res.status(201).json({success:true,message:"public share link created successfully",linkShare})
    }
    catch(error)
    
    {
        console.error("craete link share error",error.message);
        return res.status(500).json({success:false,message:"INternal server error"})
    }
}