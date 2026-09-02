import supabase from "../config/supabase.js";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const userId = req.user.userId;
    const { folderId = null } = req.body;

    const file = req.file;

    const fileName = `${Date.now()}-${file.originalname}`;

    const storagePath = `users/${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "file upload failed",
        error: error.message,
      });
    }

    const { data: urlData } = supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(data.path);

    const { data: fileData, error: dbError } = await supabase
      .from("files")
      .insert({
        name: file.originalname,
        mime_type: file.mimetype,
        size_bytes: file.size,
        storage_key: data.path,
        owner_id: userId,
        folder_id: folderId || null,
      })
      .select()
      .single();

    if (dbError) {
      return res.status(500).json({
        success: false,
        message: "file uploaded but metadata could not be saved",
        error: dbError.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "file created successfully",
      file: {
        id: fileData.id,
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        storagePath: data.path,
        url: urlData.publicUrl,
      },
    });
  } catch (error) {
    console.error("upload file error", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
