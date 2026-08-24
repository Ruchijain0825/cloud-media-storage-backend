import pool from "../config/db.js";
export const findUserByEmail = async(email)=>
{
   const result = await pool.query(`SELECT * FROM users WHERE email = $1`,[email]);
   return result.rows[0]
}
export const findByUserId = async(id)=>
{
    const result = await pool.query(
        `SELECT id,email,name,image_url,created_at from users WHERE id = $1`,[id]
    )
    return result.rows[0];
}
export const createUser = async({email,name,passwordHash})=>
{
    const result  = await pool.query(`INSERT INTO users (email,name,password_hash) VALUES ($1,$2,$3) RETURNING id,email,name,image_url,created_at`,[email,name,passwordHash])
    return result.rows[0]
}