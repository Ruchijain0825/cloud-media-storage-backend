import {jest,describe,test,expect} from "@jest/globals";

jest.unstable_mockModule("../src/config/supabase.js",()=>
({
    default:
        {
           storage:
           {
            from:jest.fn()
           },
           from:jest.fn()
        }
}));
const{uploadFile}=await import("../src/controller/file.controller.js");
const { default: supabase } =
    await import("../src/config/supabase.js");
describe("uploadFile",()=>
{
    test("should return 400 when no file is uploaded",async()=>
    {
        const req = {
            file:null,
            user:
            {
                userId:1
            }
        };
        const res = {
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        };
        await uploadFile(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"No file uploaded"
        })
    })
})
test("should return 500 when file upload fails",async()=>
{
    const mockUpload = jest.fn().mockResolvedValue({
        data:null,
        error:
        {
            message:"Storage upload failed"
        }
    });
    const mockForm = jest.fn().mockReturnValue({
        upload:mockUpload
    })
    supabase.storage.from = mockForm;

    const req = 
    {
        file:
        {
            originalname:"test.pdf",
            mimetype:"application/pdf",
            size:1000,
            buffer:Buffer.from("test")
        },
        user:
        {
            userId:1
        }
    };
    const res = 
    {
        status:jest.fn().mockReturnThis(),
        json:jest.fn()
    };
    await uploadFile(req,res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ 
        message:"file upload failed",
        error:"Storage upload failed"
    })
})
test("should upload file and save metadata successfully",async()=>
{
    const mockUpload = jest.fn().mockResolvedValue({
        data:
        {
            path:"users/1/test.pdf"
        },
        error:null
    });
    supabase.storage.from.mockReturnValue({
        upload:mockUpload
    })
    const mockSingle = jest.fn().mockResolvedValue({
        data:
        {
            id:1,
            name:"test.pdf"
        },
        error:null
    })
    const mockSelect = jest.fn().mockReturnValue({
        single:mockSingle
    });
    supabase.from.mockReturnValue({
        insert:jest.fn().mockReturnValue({
            select:mockSelect
        })
    });
    const req  = {
        file:
        {
            originalname:"test.pdf",
            mimetype:"application/pdf",
            size:1000,
            buffer:Buffer.from("test")
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
    await uploadFile(req,res);
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
        message:"file created successfully",
        file:
        {
            name:"test.pdf",
            size:1000,
            mimetype:"application/pdf",
            storagePath:"users/1/test.pdf"
        }
    })
})
test("should return 500 when file metadata can not be saved",async()=>
{
    const mockUpload = jest.fn().mockResolvedValue({
        data:
        {
            path:"users/1/test.pdf"
        },
        error:null
    })
    supabase.storage.from.mockReturnValue({
        upload:mockUpload
    });
    const mockSingle = jest.fn().mockResolvedValue({
        data:null,
        error:
        {
            message:"Database insert failed"
        }
    })
        const mockSelect = jest.fn().mockReturnValue({
        single: mockSingle
    });

    supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
            select: mockSelect
        })
    });

    const req = {
        file: {
            originalname: "test.pdf",
            mimetype: "application/pdf",
            size: 1000,
            buffer: Buffer.from("test")
        },
        user: {
            userId: 1
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await uploadFile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
        message: "file uploaded but metadata could not be saved",
        error: "Database insert failed"
    });
})
test("should return 500 when an unexpected error occurs",async()=>
{
    supabase.storage.from.mockImplementation(()=>
    {
        throw new Error("Unexpected error")
    })
    const req = 
    {
        file:
        {
            originalname:"test.pdf",
            mimetype:"application/pdf",
            size:1000,
            beffer:Buffer.from("test")
        },
        user:

        {
            userId:1
        }
    };
    const res= 
    {
        status:jest.fn().mockReturnThis(),
        json:jest.fn()
    };
    await uploadFile(req,res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
        message:"Internal server error"
    })

})