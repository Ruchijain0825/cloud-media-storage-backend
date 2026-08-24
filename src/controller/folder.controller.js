import { response } from "express";
import {createFolder,getFolderById,getChildFolder, updateFolder, deleteFolder} from "../model/folder.model.js";

export const createFolderController = async(req,res)=>
{
    try{
        const{name,parentId=null}=req.body
        if(!name)
        {
            return res.status(400).json({success:false,message:"Folder name is required"})
        }

        const ownerId=req.user.userId;

        const folder = await createFolder({
           name,ownerId,parentId
        })
        return res.status(201).json({success:true,message:"folder created successfully",folder})
    }
    catch(error)
    {
        console.error("create folder error",error);
        return res.status(500).json({success:false,message:"Internal server error"})
    }
}
export const  getFolderController = async(req,res)=>
{
    try{
        const {id}  = req.params;
        const ownerId=req.user.userId;
        const folder = await getFolderById({
            folderId:id,
            ownerId
        })
        if(!folder)
        {
            return res.status(404).json({success:false,message:"folder not found"})
        }
        return res.status(200).json({success:true,folder})
    }
    catch(error)
    {
        console.error("error accessing folder",error.message);
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }
}
export const getChildFolderController = async(req,res)=>
{
    try{
        const {id} = req.params;
        const ownerId = req.user.userId;
       const folder = await getFolderById({folderId:id,ownerId})
       if(!folder)
       {
        return res.status(404).json({success:false,message:"Folder not found"})
       }
       const childFoler = await getChildFolder({parentId:id,ownerId})

       return res.status(200).json({success:false,folder,children:
        {
            folders:childFoler,
            files:[]
        }
       })
    }catch(error)
    {
        console.error("error accessing folders",error.message);
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }
}
export const updateFolderController = async(req,res)=>
{
    try{
        const{id}=req.params;
        const{name,parentId}=req.body;

        const ownerId=req.user.userId;

        if(!name&&parentId===undefined)
        {
            return res.status(404).json({success:false,message:"Name or parentId is required"})

        }
        const folder = await updateFolder({
            folderId:id,
            ownerId,
            name,
            parentId
        })
        if(!folder)
        {
            return res.status(400).json({success:false,message:"Folder not found"})
        }
        return res.status(200).json({success:true,message:"folder updated successfully"})
    }
    catch(error)
    {
        console.log("update folder error",error.message);
        return res.status(500).json({success:false,message:"INternal server error"})
    }
}
export const deleteFolderController = async(req,res)=>
{
    try{
        const {id} = req.params;
        const ownerId = req.user.userId;
        const folder = await deleteFolder({folderId:id,ownerId})
        if(!folder)
        {
            return res.status(404).json({success:false,message:"folder not found"})
        }
        return res.status(200).json({success:true,message:"Folder deleted successfully"})
    }
    catch(error)
    {
        return res.status(500).json({success:false,message:"INternal Server Error"})
    }
}