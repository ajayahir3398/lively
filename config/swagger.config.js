const swaggerJsdoc = require('swagger-jsdoc');

// Determine environment and set appropriate server URLs
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const isProduction = process.env.NODE_ENV === 'production';

const getServers = () => {
  const servers = [];
  
  if (isDevelopment) {
    servers.push({
      url: `http://localhost:${process.env.PORT || 3000}/api`,
      description: 'Development server'
    });
  }
  
  if (isProduction || process.env.PRODUCTION_URL) {
    servers.push({
      url: process.env.PRODUCTION_URL || 'https://lively-eumd.onrender.com/api',
      description: 'Production server'
    });
  }
  
  // Fallback - show both if environment is not set
  if (!isDevelopment && !isProduction) {
    servers.push(
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Development server'
      },
      {
        url: 'https://lively-eumd.onrender.com/api',
        description: 'Production server'
      }
    );
  }
  
  return servers;
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lively Auth API',
      version: '1.0.0',
      description: 'API for customer authentication with OTP-based login functionality.',
      contact: {
        name: 'API Support',
        email: 'support@lively.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: getServers(),
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            flag: { type: 'boolean', example: false, description: 'Operation status flag' },
            error: { type: 'string', description: 'Error details (only in catch blocks)', nullable: true },
            message: { type: 'string', description: 'Error message' }
          }
        },

        SendOTPRequest: {
          type: 'object',
          required: ['phone_number'],
          properties: {
            phone_number: { type: 'string', description: 'Phone number to send OTP to', example: '1234567890' }
          }
        },
        SendOTPResponse: {
          type: 'object',
          properties: {
            flag: { type: 'boolean', example: true },
            message: { type: 'string', example: 'OTP sent successfully!' }
          }
        },
        VerifyOTPRequest: {
          type: 'object',
          required: ['phone_number', 'otp'],
          properties: {
            phone_number: { type: 'string', description: 'Phone number used for login', example: '1234567890' },
            otp: { type: 'string', description: 'OTP code received', example: '123456' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            flag: { type: 'boolean', example: true },
            hasBasicInfo: { type: 'boolean', description: 'Whether customer has completed basic info (name and email)' },
            message: { type: 'string', example: 'Login successful!' },
            token: { type: 'string', description: 'JWT token for authentication' }
          }
        },
        AddCustomerBasicInfoRequest: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { 
              type: 'string', 
              description: 'Customer name',
              example: 'John Doe',
              minLength: 2,
              maxLength: 60
            },
            email: { 
              type: 'string', 
              format: 'email',
              description: 'Customer email address',
              example: 'john.doe@example.com',
              maxLength: 40
            }
          }
        },
        AddCustomerBasicInfoResponse: {
          type: 'object',
          properties: {
            flag: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Customer basic info updated successfully!' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'integer', description: 'Customer login ID' },
                name: { type: 'string', description: 'Customer name' },
                email: { type: 'string', description: 'Customer email' },
                phone_number: { type: 'string', description: 'Customer phone number' }
              }
            }
          }
        },
        UpdateCustomerProfileRequest: {
          type: 'object',
          properties: {
            name: { 
              type: 'string', 
              description: 'Customer name',
              example: 'John Doe',
              minLength: 2,
              maxLength: 60
            },
            email: { 
              type: 'string', 
              format: 'email',
              description: 'Primary email address',
              example: 'john.doe@example.com',
              maxLength: 40
            },
            email2: { 
              type: 'string', 
              format: 'email',
              description: 'Alternate email address',
              example: 'john.alternate@example.com',
              maxLength: 40
            },
            login_name: { 
              type: 'string', 
              description: 'Login name',
              example: 'johndoe',
              minLength: 2,
              maxLength: 100
            },
            mobile_phone1: { 
              type: 'string', 
              description: 'Primary mobile phone number',
              example: '1234567890',
              maxLength: 20
            },
            mobile_phone2: { 
              type: 'string', 
              description: 'Alternate mobile phone number',
              example: '1987654321',
              maxLength: 20
            },
            home_phone: { 
              type: 'string', 
              description: 'Home phone number',
              example: '+1555123456',
              maxLength: 20
            },
            work_phone: { 
              type: 'string', 
              description: 'Work phone number',
              example: '+1555987654',
              maxLength: 20
            },
            work_phone_ext: { 
              type: 'string', 
              description: 'Work phone extension',
              example: '123',
              maxLength: 10
            },
            gender: { 
              type: 'string', 
              description: 'Gender',
              example: 'male',
              enum: ['male', 'female', 'other']
            },
            marital_status: { 
              type: 'string', 
              description: 'Marital status',
              example: 'married',
              enum: ['single', 'married', 'divorced', 'widowed', 'separated']
            },
            date_of_birth: { 
              type: 'string', 
              format: 'date',
              description: 'Date of birth',
              example: '1990-01-15'
            },
            national_id_no: { 
              type: 'string', 
              description: 'National ID number',
              example: '123456789',
              maxLength: 20
            },
            other_id_no: { 
              type: 'string', 
              description: 'Other ID number',
              example: '987654321',
              maxLength: 20
            },
            national_id_expiry: { 
              type: 'string', 
              format: 'date',
              description: 'National ID expiry date',
              example: '2030-12-31'
            },
            other_id_expiry: { 
              type: 'string', 
              format: 'date',
              description: 'Other ID expiry date',
              example: '2025-06-30'
            },
            comments: { 
              type: 'string', 
              description: 'Additional comments',
              example: 'Customer prefers SMS notifications',
              maxLength: 1000
            }
          }
        },
        UpdateCustomerProfileResponse: {
          type: 'object',
          properties: {
            flag: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Customer profile updated successfully!' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'integer', description: 'Customer login ID' },
                phone_number: { type: 'string', description: 'Customer phone number' },
                name: { type: 'string', description: 'Customer name', nullable: true },
                email: { type: 'string', description: 'Primary email', nullable: true },
                email2: { type: 'string', description: 'Alternate email', nullable: true },
                login_name: { type: 'string', description: 'Login name', nullable: true },
                mobile_phone1: { type: 'string', description: 'Primary mobile phone', nullable: true },
                mobile_phone2: { type: 'string', description: 'Alternate mobile phone', nullable: true },
                home_phone: { type: 'string', description: 'Home phone', nullable: true },
                work_phone: { type: 'string', description: 'Work phone', nullable: true },
                work_phone_ext: { type: 'string', description: 'Work phone extension', nullable: true },
                gender: { type: 'string', description: 'Gender', nullable: true },
                marital_status: { type: 'string', description: 'Marital status', nullable: true },
                date_of_birth: { type: 'string', format: 'date', description: 'Date of birth', nullable: true },
                national_id_no: { type: 'string', description: 'National ID number', nullable: true },
                other_id_no: { type: 'string', description: 'Other ID number', nullable: true },
                national_id_expiry: { type: 'string', format: 'date', description: 'National ID expiry', nullable: true },
                other_id_expiry: { type: 'string', format: 'date', description: 'Other ID expiry', nullable: true },
                comments: { type: 'string', description: 'Comments', nullable: true },
                state: { type: 'string', description: 'Account state' },
                login_count: { type: 'integer', description: 'Number of times logged in' },
                last_login: { type: 'string', format: 'date-time', description: 'Last login date', nullable: true },
                date_signed_up: { type: 'string', format: 'date-time', description: 'Date when customer signed up', nullable: true },
                last_activity_date: { type: 'string', format: 'date-time', description: 'Last activity date', nullable: true },
                has_basic_info: { type: 'boolean', description: 'Whether customer has completed basic info' }
              }
            }
          }
        },
        GetCustomerProfileResponse: {
          type: 'object',
          properties: {
            flag: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Customer profile retrieved successfully!' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'integer', description: 'Customer login ID' },
                phone_number: { type: 'string', description: 'Customer phone number' },
                name: { type: 'string', description: 'Customer name', nullable: true },
                email: { type: 'string', description: 'Customer email', nullable: true },
                login_name: { type: 'string', description: 'Login name', nullable: true },
                state: { type: 'string', description: 'Account state' },
                login_count: { type: 'integer', description: 'Number of times logged in' },
                last_login: { type: 'string', format: 'date-time', description: 'Last login date', nullable: true },
                date_signed_up: { type: 'string', format: 'date-time', description: 'Date when customer signed up', nullable: true },
                last_activity_date: { type: 'string', format: 'date-time', description: 'Last activity date', nullable: true },
                has_basic_info: { type: 'boolean', description: 'Whether customer has completed basic info' }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication and authorization endpoints'
      },
      {
        name: 'Customer',
        description: 'Customer management endpoints'
      }
    ]
  },
  apis: ['./routes/auth.routes.js', './routes/customer.routes.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;