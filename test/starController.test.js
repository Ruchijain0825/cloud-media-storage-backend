import{jest,describe,test,expect,beforeEach} from "@jest/globals";
jest.unstable_mockModule("../src/config/db.js",()=>
({
    default:
        {
            query:jest.fn()
        }

}));
const{addStar,removeStar}=await import("../src/controller/star.controller.js");
const{default:pool}=await import("../src/config/db.js");
describe("addStar",()=>
{
    beforeEach(()=>
    {
        jest.clearAllMocks();
    })
    test("should add star successfully for a file",async()=>
    {
        pool.query.mockResolvedValueOnce({rowCount:1,rows:[{id:1}]}).mockResolvedValueOnce({rowCount:1,rows:[{id:10,user_id:1,resource_type:"file",resource_id:1}]})
        const req = {body:{resourceType:"file",resourceId:1},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await addStar(req,res);

        expect(pool.query).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success:true,
            message:"Resource starred successfully",
            star:{
                id:10,
                user_id:1,
                resource_type:"file",
                resource_id:1
            }
        })
    })

    test("should add star successfully for a folder",async()=>
    {
        pool.query.mockResolvedValueOnce({rowCount:1,rows:[{id:2}]}).mockResolvedValueOnce({rowCount:1,rows:[{id:20,user_id:1,resource_type:"folder",resource_id:2}]})

        const req = {body:{resourceType:"folder",resourceId:2},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}
        await addStar(req,res);
        expect(pool.query).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success:true,
            message:"Resource starred successfully",
            star:
            {
                id:20,
                user_id:1,
                resource_type:"folder",
                resource_id:2
            }
        })

        
    })

    test("should return 400 when resourceType is missing",async()=>
    {
        const req = {body:{resourceId:1},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await addStar(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({success:false,message:"resourceType and resourceId are required"})
        expect(pool.query).not.toHaveBeenCalledWith();
    })
   

test("should return 400 when resourceId is missing",async()=>
{
    const req = {body:{resourceType:"file"},user:{userId:1}};
    const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}
    await addStar(req,res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success:false,
        message:"resourceType and resourceId are required"
    })
    expect(pool.query).not.toHaveBeenCalled();
})
test("should return 400 when resourceType is invalid",async()=>
{
    const req = {body:{resourceType:"image",resourceId:1},user:{userId:1}};
    const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}
    await addStar(req,res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({success:false,message:"Invalid resourceType"})
    expect(pool.query).not.toHaveBeenCalled();
})
    test("should return 404 when resource is not found",async()=>
    {
        pool.query.mockResolvedValueOnce({rowCount:0,rows:[]});

        const req = {body:{resourceType:"file",resourceId:1},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await addStar(req,res);

        expect(pool.query).toHaveBeenCalledTimes(1);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"resource not found"
        });
    })

    test("should return 201 when resource id already starred",async()=>
    {
        pool.query.mockResolvedValueOnce({rowCount:1,rows:[{id:1}]}).mockResolvedValueOnce({rowCount:0,rows:[]});

        const req = {body:{resourceType:"file",resourceId:1},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await addStar(req,res);
        expect(pool.query).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success:true,
            message:"Resource starred successfully",
            star:null
        })
    })
     test("should return 500 when resource check database error occurs",async()=>
    {
        pool.query.mockRejectedValueOnce(new Error("Database error"));
        const req = {body:{resourceType:"file",resourceId:1},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await addStar(req,res);
        expect(pool.query).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"failed to star resource"
        })
    })
    })
    

describe("removeStar",()=>
{
    beforeEach(()=>
    {
        jest.clearAllMocks();
    })
    test("should remove star successfully",async()=>
    {
        pool.query.mockResolvedValueOnce({
            rowCount:1,
            rows:[{
                id:10,
                user_id:1,
                resource_type:"file",resource_id:1
            }]
        });
    const req = {body:{resourceType:"file",resourceId:1},user:{userId:1}};
    const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}
    await removeStar(req,res);
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({success:true,message:"Resource unstarred successfully",star:
        {
            id:10,
            user_id:1,
            resource_type:"file",
            resource_id:1
        }
    })

    })
    test("should return 400 when resourceType is missing",async()=>
    {
       const req = {body:{resourceId:1},user:{userId:1}};
       const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}
       await removeStar(req,res);
       expect(res.status).toHaveBeenCalledWith(400);
       expect(res.json).toHaveBeenCalledWith({
        success:false,
        message:"resourceType and resourceId are required"
       });
       expect(pool.query).not.toHaveBeenCalled();
    })
        test("should return 400 when resourceId is missing",async()=>
    {
        const req = {body:{resourceType:"file"},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await removeStar(req,res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"resourceType and resourceId are required"
        });

        expect(pool.query).not.toHaveBeenCalled();
    })
    test("should return 400 when resourceType is invalid",async()=>
    {
        const req = {body:{resourceType:"image",resourceId:1},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}
        await removeStar(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"Invalid resourceType"
        });
        expect(pool.query).not.toHaveBeenCalled();
})
    test("should return 404 when star is not found",async()=>
    {
        pool.query.mockResolvedValueOnce({
            rowCount:0,
            rows:[]
        });
        const req = {body:{resourceType:"file",resourceId:1},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await removeStar(req,res);
        expect(pool.query).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({success:false,message:"Star not found"})
    })
    test("should remove star successfully for a folder",async()=>
    {
      pool.query.mockResolvedValueOnce({
        rowCount:1,
        rows:[{
            id:20,
            user_id:1,
            resource_type:"folder",
            resource_id:2
        }]
      })
      const req = {body:{resourceType:"folder",resourceId:2},user:{userId:1}};
      const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}
      await removeStar(req,res);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success:true,
        message:"Resource unstarred successfully",
        star:
        {
            id:20,
            user_id:1,
            resource_type:"folder",
            resource_id:2
        }
      })
    })
      test("should return 500 when database error occurs",async()=>
    {
        pool.query.mockRejectedValue(new Error("Databse error"));
        const req = {body:{resourceType:"file",resourceId:1},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await removeStar(req,res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"Failed to remove star"
        })
    })
})
