const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

// Protect routes - requires valid JWT
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized. Please login.' });
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    // Attach decoded token data for role checks
    req.userRole = decoded.role || req.user.role || 'user';
    req.userPermissions = decoded.permissions || req.user.permissions || [];
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Role-based access control middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.userRole || req.user?.role || 'user';
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }
    next();
  };
};

// Permission-based access control middleware
const hasPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    const userPermissions = req.userPermissions || req.user?.permissions || [];
    const hasAll = requiredPermissions.every(p => userPermissions.includes(p));
    if (!hasAll) {
      return res.status(403).json({ 
        message: `Access denied. Required permission: ${requiredPermissions.join(', ')}` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize, hasPermission };
