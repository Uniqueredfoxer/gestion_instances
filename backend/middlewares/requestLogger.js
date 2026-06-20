// middleware/requestLogger.js
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    
  
    const ip = req.socket.remoteAddress;
    

    console.log('\n' + '='.repeat(80));
    console.log(`${req.method} ${req.url}`);
    console.log(` Date and time : ${timestamp.split('T')[0]} ${timestamp.split('T')[1].split('.')[0]}`);
    console.log(` IP: ${ip}`);
    console.log('origin' , req.headers['origin'])
    
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(` Body:`, JSON.stringify(req.body, null, 2));
    }
    
  
        
    if(res.statusCode === 200){
        console.log(`Response: \x1b[32m${res.statusCode}\x1b[0m OK`);
    }else if(res.statusCode ===201){
        console.log(`Response: \x1b[32m${res.statusCode}\x1b[0m Created`);
    }else if(res.statusCode === 400){
        console.log(`Error: \x1b[31m${res.statusCode}\x1b[0m Bad Request`);
    }else if(res.statusCode === 401){
        console.log(`Error: \x1b[31m${res.statusCode}\x1b[0m Not Authorized`);
    }else if(res.statusCode === 403){
        console.log(`Error: \x1b[31m${res.statusCode}\x1b[0m Forbidden`);
    }else if(res.statusCode === 404){
        console.log(`Error: \x1b[31m${res.statusCode}\x1b[0m Not Found`);
    }else if(res.statusCode === 405){
        console.log(`Error: \x1b[31m${res.statusCode}\x1b[0m Method Not Allowed`);
    }else{
        console.log(`Error: \x1b[31m${res.statusCode}\x1b[0m `);
    }
    
        
        
        console.log('='.repeat(80) + '\n');
    
    next();
};