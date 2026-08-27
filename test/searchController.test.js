import {
    jest,
    describe,
    test,
    expect,
    beforeEach
} from "@jest/globals";

jest.unstable_mockModule("../src/config/db.js", () => ({
    default: {
        query: jest.fn()
    }
}));

const { searchController } =
    await import("../src/controller/search.controller.js");

const { default: pool } =
    await import("../src/config/db.js");


describe("searchController", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });


    // 1. q missing
    test("should return 400 when search query is missing", async () => {

        const req = {
            query: {},
            user: {
                userId: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await searchController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Search query is required"
        });

        expect(pool.query).not.toHaveBeenCalled();
    });


    // 2. q empty
    test("should return 400 when search query is empty", async () => {

        const req = {
            query: {
                q: "   "
            },
            user: {
                userId: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await searchController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Search query is required"
        });

        expect(pool.query).not.toHaveBeenCalled();
    });


    // 3. Invalid page
    test("should return 400 when page is invalid", async () => {

        const req = {
            query: {
                q: "document",
                page: "0"
            },
            user: {
                userId: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await searchController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid page or limit"
        });

        expect(pool.query).not.toHaveBeenCalled();
    });


    // 4. Invalid limit
    test("should return 400 when limit is invalid", async () => {

        const req = {
            query: {
                q: "document",
                page: "1",
                limit: "101"
            },
            user: {
                userId: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await searchController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid page or limit"
        });

        expect(pool.query).not.toHaveBeenCalled();
    });


    // 5. Successful search
    test("should return 200 when files and folders are found", async () => {

        pool.query
            .mockResolvedValueOnce({
                rows: [
                    {
                        id: 1,
                        name: "document.pdf",
                        mime_type: "application/pdf",
                        size_bytes: 1000,
                        folder_id: null,
                        created_at: "2026-01-01"
                    }
                ]
            })
            .mockResolvedValueOnce({
                rows: [
                    {
                        id: 2,
                        name: "Documents",
                        parent_id: null,
                        created_at: "2026-01-01"
                    }
                ]
            })
            .mockResolvedValueOnce({
                rows: [{ count: "1" }]
            })
            .mockResolvedValueOnce({
                rows: [{ count: "1" }]
            });

        const req = {
            query: {
                q: "document",
                page: "1",
                limit: "10"
            },
            user: {
                userId: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await searchController(req, res);

        expect(pool.query).toHaveBeenCalledTimes(4);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: {
                files: [
                    {
                        id: 1,
                        name: "document.pdf",
                        mime_type: "application/pdf",
                        size_bytes: 1000,
                        folder_id: null,
                        created_at: "2026-01-01"
                    }
                ],
                folders: [
                    {
                        id: 2,
                        name: "Documents",
                        parent_id: null,
                        created_at: "2026-01-01"
                    }
                ]
            },
            pagination: {
                page: 1,
                limit: 10,
                totalCount: 2,
                hasNextPage: false
            }
        });
    });


    // 6. No results
    test("should return 200 when no files or folders are found", async () => {

        pool.query
            .mockResolvedValueOnce({
                rows: []
            })
            .mockResolvedValueOnce({
                rows: []
            })
            .mockResolvedValueOnce({
                rows: [{ count: "0" }]
            })
            .mockResolvedValueOnce({
                rows: [{ count: "0" }]
            });

        const req = {
            query: {
                q: "xyz",
                page: "1",
                limit: "10"
            },
            user: {
                userId: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await searchController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: {
                files: [],
                folders: []
            },
            pagination: {
                page: 1,
                limit: 10,
                totalCount: 0,
                hasNextPage: false
            }
        });
    });


    // 7. Pagination
    test("should calculate pagination correctly", async () => {

        pool.query
            .mockResolvedValueOnce({
                rows: []
            })
            .mockResolvedValueOnce({
                rows: []
            })
            .mockResolvedValueOnce({
                rows: [{ count: "25" }]
            })
            .mockResolvedValueOnce({
                rows: [{ count: "5" }]
            });

        const req = {
            query: {
                q: "document",
                page: "2",
                limit: "10"
            },
            user: {
                userId: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await searchController(req, res);

        expect(pool.query).toHaveBeenCalledTimes(4);

        // page 2 × limit 10 = 20
        // totalCount = 30
        // therefore next page exists

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                pagination: {
                    page: 2,
                    limit: 10,
                    totalCount: 30,
                    hasNextPage: true
                }
            })
        );
    });


    // 8. Database error
    test("should return 500 when database error occurs", async () => {

        pool.query.mockRejectedValue(
            new Error("Database error")
        );

        const req = {
            query: {
                q: "document",
                page: "1",
                limit: "10"
            },
            user: {
                userId: 1
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await searchController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Search failed"
        });
    });

});