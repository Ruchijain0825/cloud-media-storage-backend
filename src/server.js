import "dotenv/config"
import app from "./app.js";
import pool from './config/db.js'
const PORT = process.env.PORT||8080;

const startServer = async()=>

    {
        try{
            await pool.query("SELECT NOW()");
            console.log("Postrge Connected ✅")
            app.listen(PORT,()=>
{
    console.log(`server is running on ${PORT}`);
})
        }catch(error)
        {
            console.error("Database connection failed:",error.message);
            process.exit(1)
        }
    }
startServer();