import pool from '../config/db.js'
export const restoreFromTrash = async(req,res)=>
{
    try{
        const{resourceType,resourceId}=req.body;
        const userId = req.user.userId;
        if(!resourceType||!resourceId)
        {
            return res.status(400).json({success:false,message:"resourceType and resourceId are required"})
        }
        if(!["file","folder"].includes(resourceType))

            {
                return res.status(400).json({success:false,message:"Invalid resourceType"})
            }
            const table = resourceType === "file"?"files":"folders";
            const result = await pool.query(`UPDATE ${table} SET is_deleted = false , updated_at = now() WHERE id = $1 AND owner_id=$2 AND is_deleted = true RETURNING * `,[resourceId,userId])

            if(result.rowCount===0)
            {
                return res.status(404).json({success:false,message:"deleted resource not found!"})
            }
            return res.status(200).json({success:true,message:"resource restored successfully",resource:result.rows[0]})
    }
    catch(error)
    {
        console.error("Restore error:",error);
        return res.status(500).send({success:false,message:"Failed to restore resource"})
    }
}