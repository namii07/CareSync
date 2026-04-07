const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Cast id back to ObjectId so Mongoose queries work correctly
        req.user = { ...decoded, id: new mongoose.Types.ObjectId(decoded.id) };
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
        return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
};

module.exports = { protect, requireRole };
