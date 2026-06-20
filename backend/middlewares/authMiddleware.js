import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if(!JWT_SECRET){
    console.log("error loading JWT_SECRET env var")
}

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired" });
        }
        con
        return res.status(403).json({ error: err });
    }
};


export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
    next();
};


export const requireOwnershipOrAdmin = (req, res, next) => {
    const requestedUserId = parseInt(req.params.id);
    const currentUserId = req.user.id;
    
    if (req.user.role === 'admin' || currentUserId === requestedUserId) {
        next();
    } else {
        res.status(403).json({ error: "Access denied. You can only modify your own account." });
    }
};