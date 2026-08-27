import {jest, describe , test , expect } from "@jest/globals";
import { success } from "zod";





jest.unstable_mockModule("../src/model/folder.model.js",()=>({
    createFolder:jest.fn(),
    getFolderById:jest.fn(),
    getChildFolder:jest.fn(),
    updateFolder:jest.fn(),
    deleteFolder:jest.fn()
}))

const { createFolderController,getFolderController,getChildFolderController,updateFolderController,deleteFolderController} =
    await import("../src/controller/folder.controller.js");

const { createFolder,getFolderById,getChildFolder,updateFolder,deleteFolder } =
    await import("../src/model/folder.model.js");
describe("createFolderController",()=>
{
    test("should return 400 when folder name is missing",async()=>
    {
        const req = 
        {
            body:{},
            user:{
                userId: 1
            }
        };
        const res = {
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        };
        await createFolderController(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({success:false,message:"Folder name is required"})
        expect(createFolder).not.toHaveBeenCalled()
    })
})
test("should return 500 when createFolder fails",async()=>
{
    createFolder.mockRejectedValue(new Error("Database error"));

    const req = 
    {
        body :
        {
            name:"Documents",
            parentId:null
        },
        user : 
        {
            userId:1
        }
    };
    const res = {
        status: jest.fn().mockReturnThis(),
        json:jest.fn()
    };
    await createFolderController(req,res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({success:false,message:"Internal server error"})
    
})
test("should return 404 if the folder is not found",async()=>
{
    getFolderById.mockResolvedValue(null);
    const req = {
        params:
        {
            id:1
        },
        user:
        {
            userId: 1
        }
    }
    const res = {
        status:jest.fn().mockReturnThis(),
        json:jest.fn()
    };
    await getFolderController(req,res);
    expect(getFolderById).toHaveBeenCalledWith({
        folderId:1,
        ownerId:1
    })
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
        success:false,
        message:"folder not found"
    })
})
test("should return 200 ehen folder is found",async()=>
{
    const mockFolder = {
        id: 1,
        name: "Documents",
        owner_id: 1,
        parent_id: null
    }
    getFolderById.mockResolvedValue(mockFolder);
    const req = {
        params:
        {
            id:1
        },
        user :
        {
            userId : 1
        }
    }
    const res = {
        status: jest.fn().mockReturnThis(),
        json:jest.fn()
    }
    await getFolderController(req,res);
    expect(getFolderById).toHaveBeenCalledWith({
        folderId: 1,
        ownerId: 1
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({success:true,folder:mockFolder})
})
test("shoulr return 500 when getFolderById fails",async()=>{
    getFolderById.mockRejectedValue(new Error("Database error"));
    const req = {
        params:
        {
            id:1
        },
        user:
        {
            userId : 1
        }
    };
    const res = {
        status:jest.fn().mockReturnThis(),
        json:jest.fn()
    };
    await getFolderController(req,res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({success:false,message:"Internal Server Error"})
})
test("should return 404 when parent folder is not found", async () => {

    getFolderById.mockResolvedValue(null);

    const req = {
        params: {
            id: 1
        },
        user: {
            userId: 1
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await getChildFolderController(req, res);

    expect(getFolderById).toHaveBeenCalledWith({
        folderId: 1,
        ownerId: 1
    });

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Folder not found"
    });
});
test("should return 200 when parent folder and child folders are found",async()=>
{
    const mockFolder = {
        id:1,
        name:"Documents",
        owner_id:1,
        parent_id:null
    };
      getFolderById.mockResolvedValue(mockFolder);
      getChildFolder.mockRejectedValue(new Error("Database error"))
  
    const req = {
        params:
        {
            id:1
        },
        user:
        {
            userId: 1
        }
    };
    const res = {
        status:jest.fn().mockReturnThis(),
        json:jest.fn()
    };
    await getChildFolderController(req,res);
   
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
        success:false,
        message: "Internal Server Error"
        
    })
})
test("should return 404 when name and parentId are missing",async()=>
{
    const req = {
        params:
        {
            id:1
        },
        body :{},
        user:
        {
            userId: 1
        }
    };
    const res = {
        status : jest.fn().mockReturnThis(),
        json:jest.fn()
    };
    await updateFolderController(req,res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
        success:false,
        message:"Name or parentId is required"
    })

    expect(updateFolder).not.toHaveBeenCalled();
})
test("should return 400 when folder is not found",async()=>
{
    updateFolder.mockResolvedValue(null);
    const req ={
        params:{
            id:1
        },
        body:
        {
            name: "New Documents"
        },
        user:
        {
            userId: 1
        }
    };
    const res ={status:jest.fn().mockReturnThis(),
        json:jest.fn()};
    await updateFolderController(req,res);

    expect(updateFolder).toHaveBeenCalledWith({
        folderId:1,
        ownerId:1,
        name:"New Documents",
        parentId:undefined
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({success:false,message:"Folder not found"})
})
test("should update folder successfully",async()=>
{
    updateFolder.mockResolvedValue({
        id:1,
        name:"New Document",
        owner_id:1,
        parent_id:null
    })
    const req = {params:{
        id:1
    },
    body:{
        name:"New Documents",
        parentId:null
    },
    user:
    {
        userId:1
    }
};
const res = {
    status : jest.fn().mockReturnThis(),
    json:jest.fn()
};
await updateFolderController(req,res);
expect(updateFolder).toHaveBeenCalledWith({folderId:1,ownerId:1,name:"New Documents",parentId:null})

expect(res.status).toHaveBeenCalledWith(200);
expect(res.json).toHaveBeenCalledWith({success:true,message:"folder updated successfully"})
})
test("should return 500 when updateFolder fails",async()=>
{
    updateFolder.mockRejectedValue(
        new Error("Database error")
    );
    const req = {
        params:{
            id:1
        },
        body:
        {
            name:"New Documents"
        },
        user:
        {
            userId: 1
        }
    };
    const res = {
        status:jest.fn().mockReturnThis(),
        json:jest.fn()
    };
    await updateFolderController(req,res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
        success:false,
        message:"INternal server error"
    })
})
test("should return 404 when folder is not found",async()=>
{
    deleteFolder.mockResolvedValue(null);
    const req = {
        params:
        {
            id:1
        },
        user:
        {
            userId : 1
        }
    };
    const res = {
        status:jest.fn().mockReturnThis(),
        json:jest.fn()

    }
    await deleteFolderController(req,res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
        success:false,
        message:"folder not found"
    })
})
test("should delete folder successfully",async()=>
{
    const mockDeleteFolder = {
        id:1,
        name:"Documents",
        owner_id:1
    };
    deleteFolder.mockResolvedValue(mockDeleteFolder);
    const req = {
        params:
        {
            id:1
        },
        user:
        {
            userId:1
        }
    };
    const res = {
        status:jest.fn().mockReturnThis(),
        json:jest.fn()
    };
    await deleteFolderController(req,res);
      expect(deleteFolder).toHaveBeenCalledWith({
        folderId: 1,
        ownerId: 1
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
        success:true,
        message:"Folder deleted successfully"
    })
})
test("should return 500 when deletedFolder fails",async()=>
{
    deleteFolder.mockRejectedValue(new Error("Database error"));

    const req = 
    {
        params:
        {
            id:1
        },
        user:
        {
            userId:1
        }
    };
    const res = 
    {
        status : jest.fn().mockReturnThis(),
        json:jest.fn(),
    };
    await deleteFolderController(req,res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
        success:false,
        message:"INternal Server Error"
    })
})