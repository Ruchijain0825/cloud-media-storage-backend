import {jest,describe,test,expect,beforeEach} from "@jest/globals";

jest.unstable_mockModule("../src/config/db.js",()=>
({
    default:{
        query:jest.fn()
    }
}));

jest.unstable_mockModule("../src/model/share.model.js",()=>
({
    createShareModel:jest.fn(),
    getShareModel:jest.fn()
}));

const{createShare,getShare,deleteShare} = await import("../src/controller/share.controller.js");

const{default:pool} = await import("../src/config/db.js");

const{createShareModel,getShareModel}=await import("../src/model/share.model.js");


describe("createShare",()=>
{
    beforeEach(()=>
    {
        jest.clearAllMocks();
    })


    test("should create share successfully for a file",async()=>
    {
        pool.query.mockResolvedValueOnce({rows:[{id:1}]}).mockResolvedValueOnce({rows:[{id:2}]})

        createShareModel.mockResolvedValue({id:10,resource_type:"file",resource_id:1,grantee_user_id:2,role:"viewer",created_by:1})

        const req = { body: {resourceType:"file",resourceId:1,granteeUserId:2,role:"viewer"},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await createShare(req,res);

        expect(pool.query).toHaveBeenCalledTimes(2);

        expect(createShareModel).toHaveBeenCalledWith({resourceType:"file",resourceId:1,granteeUserId:2,role:"viewer",createdBy:1});

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith({success:true,message:"Resource shared successfully",share:{
            id:10,
            resource_type:"file",
            resource_id:1,
            grantee_user_id:2,
            role:"viewer",
            created_by:1
        }})
    })


    test("should create share successfully for a folder",async()=>
    {
        pool.query.mockResolvedValueOnce({rows:[{id:1}]}).mockResolvedValueOnce({rows:[{id:2}]})

        createShareModel.mockResolvedValue({id:11,resource_type:"folder",resource_id:1,grantee_user_id:2,role:"editor",created_by:1})

        const req = { body: {resourceType:"folder",resourceId:1,granteeUserId:2,role:"editor"},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await createShare(req,res);

        expect(pool.query).toHaveBeenCalledTimes(2);

        expect(createShareModel).toHaveBeenCalledWith({resourceType:"folder",resourceId:1,granteeUserId:2,role:"editor",createdBy:1});

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith({success:true,message:"Resource shared successfully",share:{
            id:11,
            resource_type:"folder",
            resource_id:1,
            grantee_user_id:2,
            role:"editor",
            created_by:1
        }})
    })


    test("should return 404 when resourceType is missing",async()=>
    {
        const req = { body: {resourceId:1,granteeUserId:2,role:"viewer"},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await createShare(req,res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"All fields are required!"
        });

        expect(pool.query).not.toHaveBeenCalled();

        expect(createShareModel).not.toHaveBeenCalled();
    })


    test("should return 404 when resourceId is missing",async()=>
    {
        const req = { body: {resourceType:"file",granteeUserId:2,role:"viewer"},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await createShare(req,res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"All fields are required!"
        });

        expect(pool.query).not.toHaveBeenCalled();

        expect(createShareModel).not.toHaveBeenCalled();
    })


    test("should return 404 when granteeUserId is missing",async()=>
    {
        const req = { body: {resourceType:"file",resourceId:1,role:"viewer"},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await createShare(req,res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"All fields are required!"
        });

        expect(pool.query).not.toHaveBeenCalled();

        expect(createShareModel).not.toHaveBeenCalled();
    })


    test("should return 404 when role is missing",async()=>
    {
        const req = { body: {resourceType:"file",resourceId:1,granteeUserId:2},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await createShare(req,res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"All fields are required!"
        });

        expect(pool.query).not.toHaveBeenCalled();

        expect(createShareModel).not.toHaveBeenCalled();
    })


    test("should return 400 when resourceType is invalid",async()=>
    {
        const req = { body: {resourceType:"image",resourceId:1,granteeUserId:2,role:"viewer"},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await createShare(req,res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"Invalid resourse type"
        });

        expect(pool.query).not.toHaveBeenCalled();

        expect(createShareModel).not.toHaveBeenCalled();
    })


    test("should return 400 when role is invalid",async()=>
    {
        const req = { body: {resourceType:"file",resourceId:1,granteeUserId:2,role:"admin"},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await createShare(req,res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"Invalid role"
        });

        expect(pool.query).not.toHaveBeenCalled();

        expect(createShareModel).not.toHaveBeenCalled();
    })


    test("should return 403 when user does not have permission to share resource",async()=>
    {
        pool.query.mockResolvedValueOnce({rows:[]});

        const req = { body: {resourceType:"file",resourceId:1,granteeUserId:2,role:"viewer"},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await createShare(req,res);

        expect(pool.query).toHaveBeenCalledTimes(1);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"you don't have the permission to share this resourse"
        });

        expect(createShareModel).not.toHaveBeenCalled();
    })


    test("should return 404 when user is not found",async()=>
    {
        pool.query.mockResolvedValueOnce({rows:[{id:1}]}).mockResolvedValueOnce({rows:[]});

        const req = { body: {resourceType:"file",resourceId:1,granteeUserId:2,role:"viewer"},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await createShare(req,res);

        expect(pool.query).toHaveBeenCalledTimes(2);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"user not found"
        });

        expect(createShareModel).not.toHaveBeenCalled();
    })


    test("should return 400 when user tries to share with himself",async()=>
    {
        pool.query.mockResolvedValueOnce({rows:[{id:1}]}).mockResolvedValueOnce({rows:[{id:1}]});

        const req = { body: {resourceType:"file",resourceId:1,granteeUserId:1,role:"viewer"},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await createShare(req,res);

        expect(pool.query).toHaveBeenCalledTimes(2);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"you can't share with yourself"
        });

        expect(createShareModel).not.toHaveBeenCalled();
    })


    test("should return 500 when database error occurs",async()=>
    {
        pool.query.mockRejectedValue(new Error("Database error"));

        const req = { body: {resourceType:"file",resourceId:1,granteeUserId:2,role:"viewer"},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await createShare(req,res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"Internal Server error"
        });

        expect(createShareModel).not.toHaveBeenCalled();
    })
})


describe("getShare",()=>
{
    beforeEach(()=>
    {
        jest.clearAllMocks();
    })


    test("should get shares successfully",async()=>
    {
        getShareModel.mockResolvedValue([{id:10,resource_type:"file",resource_id:1,grantee_user_id:2,role:"viewer"}]);

        const req = {params:["file",1]};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await getShare(req,res);

        expect(getShareModel).toHaveBeenCalledWith({resourceId:1,resourceType:"file"});

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({success:true,shares:[
            {
                id:10,
                resource_type:"file",
                resource_id:1,
                grantee_user_id:2,
                role:"viewer"
            }
        ]})
    })


    test("should return 200 when no shares are found",async()=>
    {
        getShareModel.mockResolvedValue([]);

        const req = {params:["file",1]};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await getShare(req,res);

        expect(getShareModel).toHaveBeenCalledWith({resourceId:1,resourceType:"file"});

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({success:true,shares:[]})
    })


    test("should get folder shares successfully",async()=>
    {
        getShareModel.mockResolvedValue([{id:11,resource_type:"folder",resource_id:5,grantee_user_id:2,role:"editor"}]);

        const req = {params:["folder",5]};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await getShare(req,res);

        expect(getShareModel).toHaveBeenCalledWith({resourceId:5,resourceType:"folder"});

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({success:true,shares:[
            {
                id:11,
                resource_type:"folder",
                resource_id:5,
                grantee_user_id:2,
                role:"editor"
            }
        ]})
    })


    test("should return 400 when resourceType is missing",async()=>
    {
        const req = {params:[undefined,1]};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await getShare(req,res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"fields not found!"
        });

        expect(getShareModel).not.toHaveBeenCalled();
    })


    test("should return 400 when resourceId is missing",async()=>
    {
        const req = {params:["file",undefined]};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await getShare(req,res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"fields not found!"
        });

        expect(getShareModel).not.toHaveBeenCalled();
    })


    test("should return 500 when database error occurs",async()=>
    {
        getShareModel.mockRejectedValue(new Error("Database error"));

        const req = {params:["file",1]};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await getShare(req,res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"Internal server error"
        });
    })
})


describe("deleteShare",()=>
{
    beforeEach(()=>
    {
        jest.clearAllMocks();
    })


    test("should return 400 when shareId is missing",async()=>
    {
        const req = {params:{}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await deleteShare(req,res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"shareId is required"
        });

        expect(getShareModel).not.toHaveBeenCalled();
    })


    test("should return 404 when shareId does not exist",async()=>
    {
        getShareModel.mockResolvedValue(null);

        const req = {params:{id:10}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await deleteShare(req,res);

        expect(getShareModel).toHaveBeenCalledWith(10);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"share id not found"
        });
    })


    test("should return 404 when shareId is undefined",async()=>
    {
        const req = {params:{id:undefined}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await deleteShare(req,res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"shareId is required"
        });

        expect(getShareModel).not.toHaveBeenCalled();
    })


    test("should return 500 when database error occurs",async()=>
    {
        getShareModel.mockRejectedValue(new Error("Database error"));

        const req = {params:{id:10}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await deleteShare(req,res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"Internal Server Error"
        });
    })

})