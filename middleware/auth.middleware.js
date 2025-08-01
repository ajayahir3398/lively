const jwt = require('jsonwebtoken');
const db = require('../models');
const Customer_Login = db.customer_login;

// Token blacklist manager
const tokenBlacklistManager = require('../utils/tokenBlacklistManager');

const verifyToken = async (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];

  if (!token) {
    return res.status(403).json({
      flag: false,
      message: "No token provided!"
    });
  }

  try {
    const cleanToken = token.replace('Bearer ', '');
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if token is blacklisted
    if (tokenBlacklistManager.isBlacklisted(cleanToken)) {
      return res.status(401).json({ 
        flag: false,
        message: 'Token has been invalidated' 
      });
    }
    
    // Get user from database
    const customer_login = await Customer_Login.findByPk(decoded.id);
    if (!customer_login) {
      return res.status(401).json({ 
        flag: false,
        message: 'Invalid token - user not found' 
      });
    }

    // Check if account is disabled
    if (customer_login.login_disabled) {
      return res.status(403).json({
        flag: false,
        message: "Account is disabled!"
      });
    }

    // Check if account is blocked
    if (customer_login.state === 'blocked') {
      return res.status(403).json({
        flag: false,
        message: "Account is blocked!"
      });
    }

    // Add user info to request object
    req.userId = decoded.id;
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        flag: false,
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        flag: false,
        message: 'Token expired' 
      });
    }
    return res.status(500).json({ 
      flag: false,
      error: error.message,
      message: 'Authentication error' 
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'] || req.headers['authorization'];

    if (token) {
      const cleanToken = token.replace('Bearer ', '');
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'your-secret-key');
      
      const customer_login = await Customer_Login.findByPk(decoded.id);
      if (customer_login && !customer_login.login_disabled && customer_login.state !== 'blocked') {
        req.userId = decoded.id;
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

const isAdmin = (req, res, next) => {
  // Add admin check logic here if needed
  next();
};

const authJwt = {
  verifyToken,
  optionalAuth,
  isAdmin,
  tokenBlacklistManager
};

module.exports = authJwt;