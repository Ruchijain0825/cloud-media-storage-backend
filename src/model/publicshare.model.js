
import pool from '../config/db.js'
export const getLinkShareByTokenModel = async(token)=>
{
    const result = await pool.query(
        `SELECT * FROM link_shares where token = $1`,[token]

    )
    return result.rows[0]
}