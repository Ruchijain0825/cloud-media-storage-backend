import pool from "../config/db.js"
import { createShareModel, getShareModel } from "../model/share.model.js"
export const createShare = async(req,res)=>
{
    try{
        const{resourceType,resourceId,granteeUserId,role}=req.body;
        const ownerId = req.user.userId;
        if(!resourceType||!resourceId||!granteeUserId||!role)
        {
            return res.status(404).json({success:false,message:'All fields are required!'})
        }
         if(!["file","folder"].includes(resourceType))
         {
            return res.status(400).json({success:false,message:"Invalid resourse type"})
         }

         if(!["viewer","editor"].includes(role))
         {
            return res.status(400).json({success:false,message:"Invalid role"})
         }
         const table = resourceType === "file"?"files":"folder"
         const resource = await pool.query(`SELECT id FROM ${table} where id = $1 AND owner_id = $2 AND is_deleted = false`,[resourceId,ownerId])
         if(resource.rows.length === 0)
         {
            return res.status(403).json({success:false,message:"you don't have the permission to share this resourse"})
         }
         const user = await pool.query(`SELECT id FROM  users WHERE id = $1`,[granteeUserId])

         if(user.rows.length===0)
         {
            return res.status(404).json({success:false,message:"user not found"})
         }
         if(ownerId===granteeUserId)
         {
            return res.status(400).json({success:false,message:"you can't share with yourself"})
         }
         const share = await createShareModel({resourceType,resourceId,granteeUserId,role,createdBy:ownerId})

         return res.status(201).json({success:true,message:"Resource shared successfully",share})


        }
        catch(error)
        {
            console.error("create share error",error);
            return res.status(500).json({success:false,message:"Internal Server error"})
        }
}
export const getShare = async(req,res)=>
{
    try{
        const[resourceType,resourceId]=req.params;
        
        if(!resourceType||!resourceId)
        {
            return res.status(400).json({success:false,message:"fields not found!"})
        }
        const shares =  await getShareModel({
            resourceId,resourceType
        })
        return res.status(200).json({success:true,shares})
    }
    catch(error)
    {
      console.error("shares errors",error.message);
      return res.status(500).json({success:false,message:"Internal server error"})

    }
}
export const deleteShare = async(req,res)=>
{
    try{
        const {id}=req.params;
        if(!id)
        {
            return res.status(400).json({success:false,message:"shareId is required"})
        }
        const deletedShare = await getShareModel(id);
        if(!deletedShare)
        {
            return res.status(404).json({success:false,message:"share id not found"})
        }
        return res.status(200).json({success:true,message:"share revoked successfully!",share:deleteShare})
    }
    catch(error)
    {
        console.error("share deletion",error.message);
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }
}