const baseResponse = require('../utils/baseResponse.util');

const authorize = (allowedRoles = []) => {
    // Ensure allowedRoles is always an array
    if (typeof allowedRoles === 'string') {
        allowedRoles = [allowedRoles];
    }

    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            // This should ideally be caught by authenticateJWT first
            return baseResponse(res, false, 401, "Authentication required.", null);
        }

        const userRole = req.user.role;
        
        if (allowedRoles.length && !allowedRoles.includes(userRole)) {
            return baseResponse(res, false, 403, "Forbidden. You do not have the necessary permissions for this action.", null);
        }
        
        next();
    };
};

module.exports = authorize;