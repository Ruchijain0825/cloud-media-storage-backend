import{jest,describe,test,expect,beforeEach} from "@jest/globals";
jest.unstable_mockModule("../src/services/auth.service.js",()=>
({
    registerUser:jest.fn(),
    loginUser:jest.fn()
}));
const{signup,login,logout}=await import("../src/controller/auth.controller.js");
const{registerUser,loginUser}=await import("../src/services/auth.service.js");

describe("signup",()=>
{
    beforeEach(()=>
    {
        jest.clearAllMocks();
    })

    test("should signup successfully",async()=>
    {
        registerUser.mockResolvedValue({
            id:1,
            name:"Ruchi",
            email:"ruchi@gmail.com"
        });

        const req = {
            body:{
                name:"Ruchi",
                email:"ruchi@gmail.com",
                password:"123456"
            }
        };

        const res = {
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

        await signup(req,res);

        expect(registerUser).toHaveBeenCalledWith({
            name:"Ruchi",
            email:"ruchi@gmail.com",
            password:"123456"
        });

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith({
            success:true,
            message:"user created successfully"
        })
    })

    test("should return 400 when email is missing",async()=>
    {
        const req = {
            body:{
                name:"Ruchi",
                password:"123456"
            }
        };

        const res = {
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

        await signup(req,res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"email and password are required"
        });

        expect(registerUser).not.toHaveBeenCalled();
    })

    test("should return 400 when password is missing",async()=>
    {
        const req = {
            body:{
                name:"Ruchi",
                email:"ruchi@gmail.com"
            }
        };

        const res = {
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

        await signup(req,res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"email and password are required"
        });

        expect(registerUser).not.toHaveBeenCalled();
    })

    test("should return 400 when name is missing",async()=>
    {
        const req = {
            body:{
                email:"ruchi@gmail.com",
                password:"123456"
            }
        };

        const res = {
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

        await signup(req,res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"email and password are required"
        });

        expect(registerUser).not.toHaveBeenCalled();
    })

    test("should return 409 when user already exists",async()=>
    {
        registerUser.mockRejectedValue(
            new Error("user already exists")
        );

        const req = {
            body:{
                name:"Ruchi",
                email:"ruchi@gmail.com",
                password:"123456"
            }
        };

        const res = {
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

        await signup(req,res);

        expect(registerUser).toHaveBeenCalledTimes(1);

        expect(res.status).toHaveBeenCalledWith(409);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"user already exists"
        })
    })

    test("should return 500 when database error occurs",async()=>
    {
        registerUser.mockRejectedValue(
            new Error("Database error")
        );

        const req = {
            body:{
                name:"Ruchi",
                email:"ruchi@gmail.com",
                password:"123456"
            }
        };

        const res = {
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

        await signup(req,res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"Internal Server Error"
        })
    })
})


describe("login",()=>
{
    beforeEach(()=>
    {
        jest.clearAllMocks();
    })

    test("should login successfully",async()=>
    {
        loginUser.mockResolvedValue({
            user:{
                id:1,
                name:"Ruchi",
                email:"ruchi@gmail.com"
            },
            accessToken:"access-token",
            refreshToken:"refresh-token"
        });

        const req = {
            body:{
                email:"ruchi@gmail.com",
                password:"123456"
            }
        };

        const res = {
            cookie:jest.fn(),
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

        await login(req,res);

        expect(loginUser).toHaveBeenCalledWith({
            email:"ruchi@gmail.com",
            password:"123456"
        });

        expect(res.cookie).toHaveBeenCalledWith(
            "refreshToken",
            "refresh-token",
            {
                httpOnly:true,
                secure:process.env.NODE_ENV==="production",
                sameSite:"strict",
                maxAge:2*24*60*60*1000
            }
        );

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            success:true,
            message:"Login Successfully",
            user:{
                id:1,
                name:"Ruchi",
                email:"ruchi@gmail.com"
            },
            accessToken:"access-token"
        })
    })

    test("should return 400 when email is missing",async()=>
    {
        const req = {
            body:{
                password:"123456"
            }
        };

        const res = {
            cookie:jest.fn(),
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

        await login(req,res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"email and password are required"
        });

        expect(loginUser).not.toHaveBeenCalled();
    })

    test("should return 400 when password is missing",async()=>
    {
        const req = {
            body:{
                email:"ruchi@gmail.com"
            }
        };

        const res = {
            cookie:jest.fn(),
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

        await login(req,res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"email and password are required"
        });

        expect(loginUser).not.toHaveBeenCalled();
    })

    test("should return 401 when email or password is invalid",async()=>
    {
        loginUser.mockRejectedValue(
            new Error("Invalid email or password")
        );

        const req = {
            body:{
                email:"wrong@gmail.com",
                password:"wrongpassword"
            }
        };

        const res = {
            cookie:jest.fn(),
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

        await login(req,res);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"Invalid email or password"
        })
    })

    test("should return 500 when database error occurs",async()=>
    {
        loginUser.mockRejectedValue(
            new Error("Database error")
        );

        const req = {
            body:{
                email:"ruchi@gmail.com",
                password:"123456"
            }
        };

        const res = {
            cookie:jest.fn(),
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

        await login(req,res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"internal server error"
        })
    })

    test("should set refresh token cookie",async()=>
    {
        loginUser.mockResolvedValue({
            user:{
                id:1,
                name:"Ruchi",
                email:"ruchi@gmail.com"
            },
            accessToken:"access-token",
            refreshToken:"refresh-token"
        });

        const req = {
            body:{
                email:"ruchi@gmail.com",
                password:"123456"
            }
        };

        const res = {
            cookie:jest.fn(),
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

        await login(req,res);

        expect(res.cookie).toHaveBeenCalledTimes(1);

        expect(res.cookie.mock.calls[0][0])
            .toBe("refreshToken");

        expect(res.cookie.mock.calls[0][1])
            .toBe("refresh-token");
    })
})


describe("logout",()=>
{
    beforeEach(()=>
    {
        jest.clearAllMocks();
    })

    test("should logout successfully",async()=>
    {
        const req = {};

        const res = {
            clearCookie:jest.fn(),
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

        await logout(req,res);

        expect(res.clearCookie).toHaveBeenCalledWith(
            "refreshToken",
            {
                httpOnly:true,
                secure:process.env.NODE_ENV==="production",
                sameSite:"strict"
            }
        );

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            success:true,
            message:"Logout Successful"
        })
    })

    test("should clear refresh token cookie",async()=>
    {
        const req = {};

        const res = {
            clearCookie:jest.fn(),
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

        await logout(req,res);

        expect(res.clearCookie).toHaveBeenCalledTimes(1);

        expect(res.clearCookie.mock.calls[0][0])
            .toBe("refreshToken");
    })

    test("should return 500 when logout error occurs",async()=>
    {
        const req = {};

        const res = {
            clearCookie:jest.fn().mockImplementation(()=>
            {
                throw new Error("Logout error");
            }),
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

        await logout(req,res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            success:false,
            message:"Internal Server Error"
        })
    })
})