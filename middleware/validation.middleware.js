const { body, validationResult } = require('express-validator');

// Validation rules for send OTP
const validateSendOTP = [
  body('phone_number')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number')
    .trim()
    .escape(),
];

// Validation rules for verify OTP
const validateVerifyOTP = [
  body('phone_number')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number')
    .trim()
    .escape(),
  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 4, max: 4 })
    .withMessage('OTP must be exactly 4 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
    .trim()
    .escape(),
];

// Validation rules for customer registration (if needed)
const validateCustomerRegistration = [
  body('customer_name')
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters')
    .trim()
    .escape(),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim()
    .escape(),
  body('phone_number')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number')
    .trim()
    .escape(),
];

// Validation rules for password reset
const validatePasswordReset = [
  body('phone_number')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number')
    .trim()
    .escape(),
];

// Validation rules for profile update
const validateProfileUpdate = [
  body('customer_name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters')
    .trim()
    .escape(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim()
    .escape(),
];

// Generic validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Custom validation functions
const customValidators = {
  // Check if phone number is unique
  isPhoneNumberUnique: async (phoneNumber) => {
    try {
      const db = require('../models');
      const Customer = db.customer;
      
      const existingCustomer = await Customer.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { login_domain: phoneNumber },
            { email: phoneNumber }
          ]
        }
      });
      
      return !existingCustomer; // Return true if unique (no existing customer)
    } catch (error) {
      console.error('Phone number uniqueness check error:', error);
      return false;
    }
  },

  // Check if customer exists
  customerExists: async (phoneNumber) => {
    try {
      const db = require('../models');
      const Customer = db.customer;
      
      const customer = await Customer.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { login_domain: phoneNumber },
            { email: phoneNumber }
          ]
        }
      });
      
      return !!customer; // Return true if customer exists
    } catch (error) {
      console.error('Customer existence check error:', error);
      return false;
    }
  }
};

// Validation for customer existence (for send OTP) - Optional for fresh user creation
const validateCustomerExists = async (req, res, next) => {
  try {
    const { phone_number } = req.body;
    
    if (!phone_number) {
      return res.status(400).json({
        message: 'Phone number is required'
      });
    }

    // For fresh user creation, we don't need to check if customer exists
    // The system will create a new user if not found
    next();
  } catch (error) {
    console.error('Customer existence validation error:', error);
    res.status(500).json({
      message: 'Error validating customer existence'
    });
  }
};

// Rate limiting validation (basic implementation)
const validateRateLimit = (req, res, next) => {
  // This is a basic implementation
  // In production, you should use a proper rate limiting library like express-rate-limit
  
  const clientIP = req.ip || req.connection.remoteAddress;
  const endpoint = req.path;
  
  // Store rate limit data in memory (not recommended for production)
  if (!req.app.locals.rateLimit) {
    req.app.locals.rateLimit = {};
  }
  
  const key = `${clientIP}:${endpoint}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5; // 5 requests per minute
  
  if (!req.app.locals.rateLimit[key]) {
    req.app.locals.rateLimit[key] = {
      requests: [],
      resetTime: now + windowMs
    };
  }
  
  const rateLimit = req.app.locals.rateLimit[key];
  
  // Reset if window has passed
  if (now > rateLimit.resetTime) {
    rateLimit.requests = [];
    rateLimit.resetTime = now + windowMs;
  }
  
  // Check if limit exceeded
  if (rateLimit.requests.length >= maxRequests) {
    return res.status(429).json({
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((rateLimit.resetTime - now) / 1000)
    });
  }
  
  // Add current request
  rateLimit.requests.push(now);
  
  next();
};

module.exports = {
  validateSendOTP,
  validateVerifyOTP,
  validateCustomerRegistration,
  validatePasswordReset,
  validateProfileUpdate,
  validateCustomerExists,
  validateRateLimit,
  handleValidationErrors,
  customValidators
}; 