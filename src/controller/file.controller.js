import supabase from '../config/supabase.js';
export const uploadFile = async(req,res)=>
{
    try{
        if(!req.file)
        {
            return res.status(400).json({success:false,message:"No file uploaded"})
        }

        const userId = req.user.userId;

        const file = req.file;

        const fileName = `${Date.now()}-${file.originalname}`;

        const storagePath = `users/${userId}/${fileName}`;

        const {data,error} = await supabase.storage.from(process.env.SUPABASE_STORAGE_BUCKET).upload(storagePath,file.buffer,
            {
                contentType:file.mimetype,
                upsert:false
            }
        )
    
    if(error)
    {
        return res.status(500).json({message:"file upload failed",error:error.message})
    }
    
    const{data:fileData,error:dbError}=await supabase.from("files").insert({name:file.originalname,mime_type:file.mimetype,size_bytes:file.size,storage_key:data.path,owner_id:userId}).select().single();
    if(dbError)
    {
        return res.status(500).json({message:"file uploaded but metadata could not be saved",error:dbError.message})
    }
    res.status(201).json({message:"file created successfully",
        file:
        {
            name:file.originalname,
            size:file.size,
            mimetype:file.mimetype,
            storagePath:data.path
        }
    })
}
catch(error)
{
   console.log(error)
   res.status(500).json({message:"Internal server error"})
}
}