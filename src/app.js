import express from "express";
import cors from "cors"
import cookiePrser from "cookie-parser"
import authRoutes from './routes/auth.routes.js'
import fileRoutes from './routes/file.route.js'
import folderRoutes from './routes/folder.route.js'
import shareRoutes from './routes/share.routes.js'
import linkshareRoutes from './routes/linkshare.routes.js'
import publicshareRoutes from './routes/publicshare.route.js'
import searchRoutes from "./routes/search.routes.js"
import starRoutes from "./routes/star.route.js"
import trashRoutes from "./routes/restore.route.js"
import passport from "./config/googleOAuth.js";
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookiePrser());
app.use(passport.initialize());
app.get("/api/health",(req,res)=>
{
    res.status(201).json({success:true,message:"API is running"})
})
app.use('/api/auth',authRoutes);
app.use('/api/files',fileRoutes);
app.use('/api/folder',folderRoutes);
app.use('/api/shares',shareRoutes);
app.use("/api/link-shares", linkshareRoutes);
app.use("/api/public-shares",publicshareRoutes);
app.use("/api/search",searchRoutes)
app.use("/api/stars",starRoutes);
app.use("/api/trash",trashRoutes)

    

export default app