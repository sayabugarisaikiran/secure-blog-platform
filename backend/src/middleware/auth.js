// ============================================================
// Auth Middleware — JWT Token Verification
// ============================================================
// Protects routes that require authentication
// Also checks for admin role on restricted routes
// ============================================================

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Verify JWT token from Authorization header
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.',
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid token.',
        });
    }
};

// Check if user has admin role
const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.',
        });
    }
    next();
};

module.exports = { authenticate, authorizeAdmin };
