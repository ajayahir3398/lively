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

// Validation rules for add customer basic info
const validateAddCustomerBasicInfo = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters')
    .trim()
    .escape(),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 40 })
    .withMessage('Email must not exceed 40 characters')
    .normalizeEmail()
    .trim()
    .escape(),
];

// Generic validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      flag: false,
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

// Rate limiting validation (basic implementation)
const validateRateLimit = (req, res, next) => {
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
      flag: false,
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
  validateAddCustomerBasicInfo,
  validateRateLimit,
  handleValidationErrors
}; 