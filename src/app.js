import express from "express";
import cookiePrser from "cookie-parser"
import authRoutes from './routes/auth.routes.js'
const app = express();
app.use(express.json());
app.use(cookiePrser());
app.get("/api/health",(req,res)=>
{
    res.status(201).json({success:true,message:"API is running"})
})
app.use('/api/auth',authRoutes)
export default app