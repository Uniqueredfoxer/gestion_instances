import {Client} from 'pg';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv'


dotenv.config()

const DB_URL = process.env.DB_URL
const file_path = path.join(process.cwd() ,"creation_tables.sql")
console.log("path: ",file_path)

if(!DB_URL){
    console.error("error: DB_URL environment variable not set");
    process.exit(1);
}
const client = new Client({connectionString: DB_URL});

try{
    await client.connect();
    console.log("database connection successfull")
    const script = await fs.readFile(file_path,'utf-8')
    console.log("creating tables now...")
    await client.query(script)
    console.log("tables created successfully")
    const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`)
    console.log("created tables: ", tables)
}
catch(err){
    console.log("Error: ", err)
}finally{
    client.end();
}


