const jwt = require("jsonwebtoken");
const baseResponse = require('../utils/baseResponse.util'); 

const authenticateJWT = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return baseResponse(res, false, 401, "Access denied. No token provided.", null);
    }

    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
         return baseResponse(res, false, 401, "Access denied. Malformed token. Expected 'Bearer <token>'.", null);
    }
    const token = tokenParts[1];

    if (!token) {
        return baseResponse(res, false, 401, "Access denied. Malformed token.", null);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded; // Contains user_id, email, role from JWT payload
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return baseResponse(res, false, 401, "Token expired. Please log in again.", null);
        }
        if (err.name === 'JsonWebTokenError') {
             return baseResponse(res, false, 403, "Invalid token. Please log in again.", null);
        }
        console.error("JWT Verification Error:", err); // Log other errors for debugging
        return baseResponse(res, false, 403, "Invalid token.", null);
    }
};

module.exports = authenticateJWT;