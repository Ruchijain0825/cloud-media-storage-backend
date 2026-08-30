import {jest,describe,test,expect,beforeEach} from "@jest/globals";
jest.unstable_mockModule("../src/config/db.js",()=>
({
    default:
        {
            query:jest.fn()
        }

}))
const{restoreFromTrash} = await import("../src/controller/trash.controller.js");
const{default:pool}=await import("../src/config/db.js");
describe("restoreFromTrash",()=>
{

    beforeEach(()=>
    {
        jest.clearAllMocks();
    })

    test("should restore file successfully",async()=>
    {
        pool.query.mockResolvedValueOnce({
            rowCount:1,
            rows:[{
                id:1,owner_id:1,name:"document.pdf",
                is_deleted:false
            }]
        });
        const req = {body:{resourceType:"file",resourceId:1},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn(),send:jest.fn()}

        await restoreFromTrash(req,res);
        expect(pool.query).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            success:true,
            message:"resource restored successfully",
            resource:
            {
                id:1,
                owner_id:1,
                name:"document.pdf",
                is_deleted:false
            }
        })
    })
    test("should restore folder successfully",async()=>
    {
        pool.query.mockResolvedValueOnce({
            rowCount:1,
            rows:[{
                id:2,
                owner_id:1,
                name:"Documents",
                is_deleted:false
            }]
        });
        const req = {body:{resourceType:"folder",resourceId:2},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn(),send:jest.fn()}
        await restoreFromTrash(req,res);
        expect(pool.query).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success:true,
            message:"resource restored successfully",
            resource:
            {
                id:2,
                owner_id:1,
                name:"Documents",
                is_deleted:false
            }
        })
    })
    test("should return 400 when resourceType is missing",async()=>
    {
        const req = {body:{resourceId:1},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn(),send:jest.fn()}
        await restoreFromTrash(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"resourceType and resourceId are required"
        });
        expect(pool.query).not.toHaveBeenCalled();
    })
    test("should return 400 and resourceId is missing",async()=>
    {
        const req = {body:{resourceType:"file"},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn(),send:jest.fn()}

        await restoreFromTrash(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"resourceType and resourceId are required"
        })
        expect(pool.query).not.toHaveBeenCalled();

    })
   
    test("should return 400 when resourceType is invalid ",async()=>
    {
        const req = {body:{resourceType:"image",resourceId:1},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn(),send:jest.fn()}
        await restoreFromTrash(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"Invalid resourceType"
        })
        expect(pool.query).not.toHaveBeenCalledWith()
    })
    test("should return 404 when deleted resource is not found",async()=>
    {
        pool.query.mockResolvedValueOnce({
            rowCount:0,
            rows:[]
        });
        const req = {body:{resourceType:"file",resourceId:1},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn(),send:jest.fn()}
        await restoreFromTrash(req,res);
        expect(pool.query).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"deleted resource not found!"
        })
    })
    test("should return 500 when database error occurs",async()=>
    {
        pool.query.mockRejectedValue(new Error("Database error"));

        const req = {body:{resourceType:"file",resourceId:1},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn(),send:jest.fn()}
        await restoreFromTrash(req,res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success:false,
            message:"Failed to restore resource"
        })
    })
    
})