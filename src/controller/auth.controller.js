import { registerUser,loginUser } from "../services/auth.service.js";

export const signup = async(req,res)=>
{
    try{
        const{email,name,password}=req.body
        if(!email||!password||!name)
        {
            return status(400).json({success:false,message:"email and password are required"});
        }
        const user = await registerUser({name,email,password});
        return res.status(201).json({success:true,message:"user created successfully"});

    }
    catch(error)
    {
        console.error("Signup error",error.message);
        if(error.message==="user already exists")
        {
            return res.status(409).json({success:false,message:error.message})
        }
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }
}
export const login = async(req,res)=>
{
    try{
        const{email,password}=req.body;
        if(!email||!password)
        {
            return res.status(400).json({success:false,message:"email and password are required"})
        }
        const{user,accessToken,refreshToken}=await loginUser({email,password});
        res.cookie("refreshToken",refreshToken,
            {
                httpOnly:true,
                secure:process.env.NODE_ENV==="production",
                sameSite:"strict",
                maxAge:2*24*60*60*1000
            }
        )
        return res.status(200).json({success:true,message:"Login Successfully",user,accessToken})
    }
    catch(error)
    {
        console.log("Login error",error.message);

        if(error.message==="Invalid email or password")
        {
            return res.status(401).json({success:false,message:error.message})
        }
    }
    return res.status(500).json({success:false,message:"internal server error"})
}
export const logout = async(req,res)=>
{
    try{
        res.clearCookie("refreshToken",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",})

        return res.status(200).json({success:true,message:"Logout Successful",})

    }
    catch(error)
    {
        return res.status(500).json({success:false,message:"Internal Server Error"})
    }
}