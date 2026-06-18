// middleware/requestLogger.js
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    
  
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    

    console.log('\n' + '='.repeat(80));
    console.log(`📨 ${req.method} ${req.url}`);
    console.log(`🕐 ${timestamp}`);
    console.log(`📍 IP: ${ip}`);
    console.log(`🌐 User-Agent: ${req.headers['user-agent'] || 'Unknown'}`);
    
  
    const safeHeaders = { ...req.headers };
    delete safeHeaders.authorization;
    delete safeHeaders.cookie;
    console.log(`📋 Headers:`, JSON.stringify(safeHeaders, null, 2));
    
    if (req.body && Object.keys(req.body).length > 0) {
        const safeBody = { ...req.body };
        if (safeBody.mdp) safeBody.mdp = '***HIDDEN***';
        if (safeBody.password) safeBody.password = '***HIDDEN***';
        console.log(`📦 Body:`, JSON.stringify(safeBody, null, 2));
    }
    
  
    const originalJson = res.json;
    let responseBody = null;
    
    res.json = function(body) {
        responseBody = body;
        return originalJson.call(this, body);
    };
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        
        // Status emoji and color
        let statusIcon = '✅';
        let statusColor = '\x1b[32m';
        if (status >= 400 && status < 500) {
            statusIcon = '⚠️';
            statusColor = '\x1b[33m';
        } else if (status >= 500) {
            statusIcon = '❌';
            statusColor = '\x1b[31m';
        }
        
        console.log(`\n${statusIcon} Response: ${statusColor}${status}\x1b[0m - ${duration}ms`);
        
        // Log response body (only for errors or in development)
        if (process.env.NODE_ENV === 'development' && responseBody) {
            console.log(`📤 Response:`, JSON.stringify(responseBody, null, 2));
        }
        
        console.log('='.repeat(80) + '\n');
    });
    
    next();
};