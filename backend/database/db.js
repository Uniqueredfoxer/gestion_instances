import {Pool} from 'pg';
import dotenv from 'dotenv'
dotenv.config()

const DB_URL=process.env.DB_URL
if(!DB_URL){
    console.log("Error: DB_URL env var not set...")
    process.exit(1)
}
const pool = new Pool({connectionString: DB_URL})
const db = pool

export default db;