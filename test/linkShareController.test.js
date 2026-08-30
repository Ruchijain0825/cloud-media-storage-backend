import {jest,describe,test,expect,beforeEach} from "@jest/globals";

jest.unstable_mockModule("../src/config/db.js",()=>
({
    default:
        {
           query:jest.fn()
        }
}));
jest.unstable_mockModule("../src/model/linkshare.model.js",()=>
({
    createLinkShareModel:jest.fn()

}))
jest.unstable_mockModule("bcrypt", () => ({
    default: {
        hash: jest.fn()
    }
}));

const {createLinkShare}=await import("../src/controller/link.controller.js");
const { default: pool } =
    await import("../src/config/db.js");

const { createLinkShareModel } =
    await import("../src/model/linkshare.model.js");

const { default: bcrypt } =
    await import("bcrypt");

describe("createLinkShare",()=>

{
      beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should return 400 when resourceType or resourceId is missing",async()=>
    {
        const req = 
        {
            body:{},
            user:
            {
                userId : 1
            }
        }
        const res = 
        {
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        };
        await createLinkShare(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"Resource type and Resource Id are required"
        })
    })

test("should return 403 when user does not have permission", async () => {

    pool.query.mockResolvedValue({
        rows: []
    });

    const req = {
        body: {
            resourceType: "file",
            resourceId: 1
        },
        user: {
            userId: 1
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await createLinkShare(req, res);

    expect(pool.query).toHaveBeenCalledWith(
        `SELECT id FROM files WHERE id = $1 AND owner_id = $2 AND is_deleted = false`,
        [1, 1]
    );

    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "you don't have permission to create this link "
    });
})

test("should return 400 when resource type is invalid", async () => {

    const req = {
        body: {
            resourceType: "image",
            resourceId: 1
        },
        user: {
            userId: 1
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await createLinkShare(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "invalid resource type"
    });

    expect(pool.query).not.toHaveBeenCalled();
});


test("should create public share link successfully", async () => {

    pool.query.mockResolvedValue({
        rows: [{ id: 1 }]
    });

    const mockLinkShare = {
        id: 10,
        resource_type: "file",
        resource_id: 1,
        role: "viewer",
        token: "abc123",
        password_hash: null,
        expires_at: null,
        created_by: 1
    };

    createLinkShareModel.mockResolvedValue(mockLinkShare);

    const req = {
        body: {
            resourceType: "file",
            resourceId: 1
        },
        user: {
            userId: 1
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await createLinkShare(req, res);

    expect(pool.query).toHaveBeenCalledWith(
        `SELECT id FROM files WHERE id = $1 AND owner_id = $2 AND is_deleted = false`,
        [1, 1]
    );

    expect(createLinkShareModel).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "public share link created successfully",
        linkShare: mockLinkShare
    });


})
test("should create share link with password", async () => {

        pool.query.mockResolvedValue({
            rows: [{ id: 1 }]
        });

        bcrypt.hash.mockResolvedValue("hashed-password");

        const mockLinkShare = {
            id: 10,
            resource_type: "file",
            resource_id: 1,
            role: "viewer",
            token: "abc123",
            password_hash: "hashed-password",
            expires_at: null,
            created_by: 1
        };

        createLinkShareModel.mockResolvedValue(mockLinkShare);

        const req = {
            body: {
                resourceType: "file",
                resourceId: 1,
                password: "mypassword"
            },
            user: {
                userId: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await createLinkShare(req, res);

        expect(bcrypt.hash).toHaveBeenCalledWith(
            "mypassword",
            10
        );

        expect(createLinkShareModel).toHaveBeenCalledWith(
            expect.objectContaining({
                resourceType: "file",
                resourceId: 1,
                role: "viewer",
                passwordHash: "hashed-password",
                createdBy: 1
            })
        );

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "public share link created successfully",
            linkShare: mockLinkShare
        });
    });
        test("should create link share successfully",async()=>
    {
        pool.query.mockResolvedValueOnce({rows:[{id:1}]});

        createLinkShareModel.mockResolvedValue({
            id:10,
            resource_type:"file",
            resource_id:1,
            role:"viewer",
            token:"abc123",
            password_hash:null,
            expires_at:null,
            created_by:1
        });

        const req = {body:{resourceType:"file",resourceId:1},user:{userId:1}};
        const res = {status:jest.fn().mockReturnThis(),json:jest.fn()}

        await createLinkShare(req,res);

        expect(pool.query).toHaveBeenCalledTimes(1);

        expect(createLinkShareModel).toHaveBeenCalledWith({
            resourceType:"file",
            resourceId:1,
            token:expect.any(String),
            role:"viewer",
            passwordHash:null,
            expiresAt:null,
            createdBy:1
        });

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith({
            success:true,
            message:"public share link created successfully",
            linkShare:{
                id:10,
                resource_type:"file",
                resource_id:1,
                role:"viewer",
                token:"abc123",
                password_hash:null,
                expires_at:null,
                created_by:1
            }
        })
    })

})