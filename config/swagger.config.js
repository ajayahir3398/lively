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
            otp: { type: 'string', description: 'OTP code received', example: '2026' }
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