import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT;
if (!port){
    console.log("cannot get port from the env vars...");
    console.log("falling back to default port 5000");
    port=5000;
    
}

app.use(express.json())

app.get("/", (req, res) => {
    console.log(`request from ${req.socket.remoteAddress}`);
    return res.json({"message": "hello from the server"})
})

app.listen(port,'0.0.0.0', ()=>{
    console.log(`the server is listening on port ${port}`)
})
