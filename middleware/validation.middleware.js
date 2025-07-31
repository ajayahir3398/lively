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
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
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

// Validation rules for update customer profile
const validateUpdateCustomerProfile = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters')
    .trim()
    .escape(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 40 })
    .withMessage('Email must not exceed 40 characters')
    .normalizeEmail()
    .trim()
    .escape(),
  body('login_name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Login name must be between 2 and 100 characters')
    .trim()
    .escape(),
  body('email2')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid alternate email address')
    .isLength({ max: 40 })
    .withMessage('Alternate email must not exceed 40 characters')
    .normalizeEmail()
    .trim()
    .escape(),
  body('mobile_phone1')
    .optional()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid mobile phone number')
    .isLength({ max: 20 })
    .withMessage('Mobile phone must not exceed 20 characters')
    .trim()
    .escape(),
  body('mobile_phone2')
    .optional()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid alternate mobile phone number')
    .isLength({ max: 20 })
    .withMessage('Alternate mobile phone must not exceed 20 characters')
    .trim()
    .escape(),
  body('home_phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Home phone must not exceed 20 characters')
    .trim()
    .escape(),
  body('work_phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Work phone must not exceed 20 characters')
    .trim()
    .escape(),
  body('work_phone_ext')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Work phone extension must not exceed 10 characters')
    .trim()
    .escape(),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other')
    .trim()
    .escape(),
  body('marital_status')
    .optional()
    .isIn(['single', 'married', 'divorced', 'widowed', 'separated'])
    .withMessage('Marital status must be single, married, divorced, widowed, or separated')
    .trim()
    .escape(),
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .trim()
    .escape(),
  body('national_id_no')
    .optional()
    .isLength({ max: 20 })
    .withMessage('National ID number must not exceed 20 characters')
    .trim()
    .escape(),
  body('other_id_no')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Other ID number must not exceed 20 characters')
    .trim()
    .escape(),
  body('national_id_expiry')
    .optional()
    .isISO8601()
    .withMessage('National ID expiry must be a valid date (YYYY-MM-DD)')
    .trim()
    .escape(),
  body('other_id_expiry')
    .optional()
    .isISO8601()
    .withMessage('Other ID expiry must be a valid date (YYYY-MM-DD)')
    .trim()
    .escape(),
  body('comments')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comments must not exceed 1000 characters')
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
  validateUpdateCustomerProfile,
  validateRateLimit,
  handleValidationErrors
}; 