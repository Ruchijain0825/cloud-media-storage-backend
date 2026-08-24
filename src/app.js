import express from "express";
import cookiePrser from "cookie-parser"
import authRoutes from './routes/auth.routes.js'
import fileRoutes from './routes/file.route.js'
import folderRoutes from './routes/folder.route.js'
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookiePrser());
app.get("/api/health",(req,res)=>
{
    res.status(201).json({success:true,message:"API is running"})
})
app.use('/api/auth',authRoutes);
app.use('/api/files',fileRoutes);
app.use('/api/folder',folderRoutes)
export default app