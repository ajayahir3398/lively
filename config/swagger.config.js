const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lively Auth API',
      version: '1.0.0',
      description: 'API for customer authentication and management with OTP-based login and secure logout functionality.',
      contact: {
        name: 'API Support',
        email: 'support@lively.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.lively.com/api',
        description: 'Production server'
      }
    ],
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
            message: { type: 'string', description: 'Error message' },
            error: { type: 'string', description: 'Error details' }
          }
        },
        Message: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Success message' }
          }
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Customer ID' },
            customer_name: { type: 'string', description: 'Customer name' },
            email: { type: 'string', format: 'email', description: 'Customer email address' },
            login_domain: { type: 'string', description: 'Phone number used for login' },
            state: { type: 'string', enum: ['active', 'blocked', 'inactive'], description: 'Customer account state' },
            initial_login: { type: 'boolean', description: 'Whether this is the first login' },
            login_count: { type: 'integer', description: 'Number of successful logins' },
            last_login: { type: 'string', format: 'date-time', description: 'Last login timestamp' },
            valid_until: { type: 'string', format: 'date-time', description: 'Account validity until date' },
            create_date: { type: 'string', format: 'date-time', description: 'Account creation date' },
            write_date: { type: 'string', format: 'date-time', description: 'Last update date' }
          }
        },
        SendOTPRequest: {
          type: 'object',
          required: ['phone_number'],
          properties: {
            phone_number: { type: 'string', description: 'Phone number to send OTP to', example: '+1234567890' }
          }
        },
        SendOTPResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'OTP sent successfully!' },
            otp: { type: 'string', description: 'OTP code (remove in production)', example: '1234' },
            expires_in: { type: 'string', example: '10 minutes' },
            user_exists: { type: 'boolean', description: 'Whether user already exists' }
          }
        },
        VerifyOTPRequest: {
          type: 'object',
          required: ['phone_number', 'otp'],
          properties: {
            phone_number: { type: 'string', description: 'Phone number used for login', example: '+1234567890' },
            otp: { type: 'string', description: 'OTP code received', example: '1234' },
            customer_name: { type: 'string', description: 'Customer name (required for first login)', example: 'John Doe' },
            email: { type: 'string', format: 'email', description: 'Email address (required for first login)', example: 'john@example.com' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Login successful!' },
            token: { type: 'string', description: 'JWT token for authentication' }
          }
        },
        LogoutResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Logout successful. Token has been invalidated.' },
            logoutTime: { type: 'string', format: 'date-time', description: 'Logout timestamp' }
          }
        },
        TokenCleanupResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Token cleanup completed successfully' },
            totalCleaned: { type: 'integer', description: 'Number of expired tokens removed' },
            usersProcessed: { type: 'integer', description: 'Number of users processed' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication and authorization endpoints'
      }
    ]
  },
  apis: ['./routes/auth.routes.js', './services/auth.service.js'] // Only include auth endpoints
};

const specs = swaggerJsdoc(options);

module.exports = specs; 