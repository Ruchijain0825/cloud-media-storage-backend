import {
    jest,
    describe,
    test,
    expect,
    beforeEach
} from "@jest/globals";


jest.unstable_mockModule("../src/model/publicshare.model.js", () => ({
    getLinkShareByTokenModel: jest.fn()
}));



jest.unstable_mockModule("../src/config/db.js", () => ({
    default: {
        query: jest.fn()
    }
}));



jest.unstable_mockModule("../src/config/supabase.js", () => ({
    default: {
        storage: {
            from: jest.fn()
        }
    }
}));


jest.unstable_mockModule("bcrypt", () => ({
    default: {
        compare: jest.fn()
    }
}));



const { resolveLinkShare } =
    await import("../src/controller/publicshare.controller.js");



const { getLinkShareByTokenModel } =
    await import("../src/model/publicshare.model.js");

const { default: pool } =
    await import("../src/config/db.js");

const { default: supabase } =
    await import("../src/config/supabase.js");

const { default: bcrypt } =
    await import("bcrypt");


describe("resolveLinkShare", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });



    test("should return 404 when share link is invalid", async () => {

        getLinkShareByTokenModel.mockResolvedValue(null);

        const req = {
            params: {
                token: "invalid-token"
            },
            body: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await resolveLinkShare(req, res);

        expect(getLinkShareByTokenModel)
            .toHaveBeenCalledWith("invalid-token");

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({
                success: false,
                message: "Invalid share link"
            });

        expect(pool.query).not.toHaveBeenCalled();
    });



    test("should return 410 when share link has expired", async () => {

        getLinkShareByTokenModel.mockResolvedValue({
            resource_id: 1,
            expires_at: "2020-01-01T00:00:00.000Z"
        });

        const req = {
            params: {
                token: "expired-token"
            },
            body: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await resolveLinkShare(req, res);

        expect(getLinkShareByTokenModel)
            .toHaveBeenCalledWith("expired-token");

        expect(res.status)
            .toHaveBeenCalledWith(410);

        expect(res.json)
            .toHaveBeenCalledWith({
                success: false,
                message: "Share link has expired"
            });

        expect(pool.query).not.toHaveBeenCalled();
    });


    test("should return 401 when password is required but not provided", async () => {

        getLinkShareByTokenModel.mockResolvedValue({
            resource_id: 1,
            expires_at: null,
            password_hash: "hashed-password"
        });

        const req = {
            params: {
                token: "protected-token"
            },
            body: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await resolveLinkShare(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(401);

        expect(res.json)
            .toHaveBeenCalledWith({
                success: false,
                message: "Password required"
            });

        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(pool.query).not.toHaveBeenCalled();
    });


    test("should return 401 when password is invalid", async () => {

        getLinkShareByTokenModel.mockResolvedValue({
            resource_id: 1,
            expires_at: null,
            password_hash: "hashed-password"
        });

        bcrypt.compare.mockResolvedValue(false);

        const req = {
            params: {
                token: "protected-token"
            },
            body: {
                password: "wrong-password"
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await resolveLinkShare(req, res);

        expect(bcrypt.compare)
            .toHaveBeenCalledWith(
                "wrong-password",
                "hashed-password"
            );

        expect(res.status)
            .toHaveBeenCalledWith(401);

        expect(res.json)
            .toHaveBeenCalledWith({
                success: false,
                message: "Invalid password"
            });

        expect(pool.query).not.toHaveBeenCalled();
    });



    test("should continue when password is valid", async () => {

        getLinkShareByTokenModel.mockResolvedValue({
            resource_id: 1,
            expires_at: null,
            password_hash: "hashed-password",
            role: "viewer"
        });

        bcrypt.compare.mockResolvedValue(true);

        pool.query.mockResolvedValue({
            rows: []
        });

        const req = {
            params: {
                token: "protected-token"
            },
            body: {
                password: "correct-password"
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await resolveLinkShare(req, res);

        expect(bcrypt.compare)
            .toHaveBeenCalledWith(
                "correct-password",
                "hashed-password"
            );

        expect(pool.query).toHaveBeenCalled();

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({
                success: false,
                message: "File not found"
            });
    });


    test("should return 404 when file is not found", async () => {

        getLinkShareByTokenModel.mockResolvedValue({
            resource_id: 1,
            expires_at: null,
            password_hash: null,
            role: "viewer"
        });

        pool.query.mockResolvedValue({
            rows: []
        });

        const req = {
            params: {
                token: "valid-token"
            },
            body: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await resolveLinkShare(req, res);

        expect(pool.query).toHaveBeenCalledWith(
            `SELECT id, name, storage_key, mime_type
       FROM files
       WHERE id = $1
       AND is_deleted = false`,
            [1]
        );

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({
                success: false,
                message: "File not found"
            });
    });



    test("should return 500 when signed URL generation fails", async () => {

        getLinkShareByTokenModel.mockResolvedValue({
            resource_id: 1,
            expires_at: null,
            password_hash: null,
            role: "viewer"
        });

        pool.query.mockResolvedValue({
            rows: [{
                id: 1,
                name: "test.pdf",
                storage_key: "users/1/test.pdf",
                mime_type: "application/pdf"
            }]
        });

        const mockCreateSignedUrl = jest.fn().mockResolvedValue({
            data: null,
            error: {
                message: "Signed URL failed"
            }
        });

        supabase.storage.from.mockReturnValue({
            createSignedUrl: mockCreateSignedUrl
        });

        const req = {
            params: {
                token: "valid-token"
            },
            body: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await resolveLinkShare(req, res);

        expect(mockCreateSignedUrl)
            .toHaveBeenCalledWith(
                "users/1/test.pdf",
                600
            );

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({
                success: false,
                message: "Signed URL generate nahi hua"
            });
    });

    test("should return 200 when share link is resolved successfully", async () => {

        getLinkShareByTokenModel.mockResolvedValue({
            resource_id: 1,
            expires_at: null,
            password_hash: null,
            role: "viewer"
        });

        pool.query.mockResolvedValue({
            rows: [{
                id: 1,
                name: "test.pdf",
                storage_key: "users/1/test.pdf",
                mime_type: "application/pdf"
            }]
        });

        const mockCreateSignedUrl = jest.fn().mockResolvedValue({
            data: {
                signedUrl: "https://example.com/signed-url"
            },
            error: null
        });

        supabase.storage.from.mockReturnValue({
            createSignedUrl: mockCreateSignedUrl
        });

        const req = {
            params: {
                token: "valid-token"
            },
            body: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await resolveLinkShare(req, res);

        expect(mockCreateSignedUrl)
            .toHaveBeenCalledWith(
                "users/1/test.pdf",
                600
            );

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({
                success: true,
                fileName: "test.pdf",
                mimeType: "application/pdf",
                signedUrl: "https://example.com/signed-url",
                role: "viewer"
            });
    });



    test("should return 500 when unexpected error occurs", async () => {

        getLinkShareByTokenModel.mockRejectedValue(
            new Error("Database error")
        );

        const req = {
            params: {
                token: "valid-token"
            },
            body: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await resolveLinkShare(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({
                success: false,
                message: "Internal server error"
            });
    });

});