import db from "../database/db";

export const checkUser = (email)=>{
    const result = await db.query(`SELECT 1 FROM users WHERE email=$1`, [email]);
    if(result.rows.length>0){
        return true
    }
    return false
}