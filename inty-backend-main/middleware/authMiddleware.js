// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    try {
        console.log('Generic Auth middleware - checking token');
        const authHeader = req.header('Authorization');
        console.log('Auth header:', authHeader);

        if (!authHeader) {
            throw new Error('No Authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        console.log('Token extracted:', token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded:', decoded);

        req.userId = decoded.id; // Store the user ID
        req.userRole = decoded.role; // Store the user's role
        console.log('User ID set:', req.userId);
        console.log('User Role set:', req.userRole);

        next();

    } catch (error) {
        console.error('Generic Auth middleware error:', error);
        let message = 'Please authenticate';
        if (error.name === 'TokenExpiredError') {
          message = 'Token expired. Please log in again.';
        }
        res.status(401).json({ message: message, error: error.message });
    }
};

module.exports = { verifyToken };