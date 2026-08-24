import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {createUser,findByUserId,findUserByEmail} from '../model/user.model.js'

export const registerUser = async({email,name,password})=>
{
    const existingUser = await findUserByEmail(email);
    if(existingUser)
    {
        throw new Error("User already exist")
    }
    const passwordHash = await bcrypt.hash(password,10);
    const user = await createUser({name,email,passwordHash});
    return user;
}
export const loginUser = async({email,password})=>
{
    const user = await findUserByEmail(email);
    if(!user)
    {
        throw new Error("invalid email or password");

    }
    const isPasswordMatch = await bcrypt.compare(password,user.password_hash)
    if(!isPasswordMatch)
    {
        throw new Error("invalid email or password")
    }
    const accessToken = jwt.sign({userId:user.id},process.env.JWT_SECRET,{expiresIn:"5m"})

    const refreshToken = jwt.sign({userId:user.id},process.env.REFRESH_SECRET,{expiresIn:"2d"})

    return {user:
        {
            id:user.id,
            email:user.email,
            name:user.name,
            image_url:user.image_url
        },

        accessToken,
        refreshToken

    }
}
export const getUserById = async(userId)=>
{
    return findByUserId(userId);
}