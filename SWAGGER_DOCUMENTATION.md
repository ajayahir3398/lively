# Swagger API Documentation

This document describes the Swagger/OpenAPI documentation setup for the Lively API.

## Overview

The API documentation is automatically generated using Swagger/OpenAPI 3.0 specification and is served through Swagger UI. The documentation includes all endpoints, request/response schemas, authentication requirements, and examples.

## Accessing the Documentation

### Development Environment
- **URL**: `http://localhost:3000/api-docs`
- **Description**: Interactive API documentation with testing capabilities

### Production Environment
- **URL**: `https://api.lively.com/api-docs`
- **Description**: Production API documentation

## Features

### 🔍 **Interactive Documentation**
- **Try it out**: Test endpoints directly from the documentation
- **Request/Response Examples**: Pre-filled examples for all endpoints
- **Authentication**: Built-in JWT token support
- **Schema Validation**: Automatic request/response validation

### 📚 **Comprehensive Coverage**
- **All Endpoints**: Complete documentation for every API endpoint
- **Request/Response Schemas**: Detailed schema definitions
- **Error Responses**: All possible error scenarios documented
- **Authentication**: JWT bearer token authentication documented

### 🏷️ **Organized by Tags**
- **Authentication**: Login, logout, and token management
- **Customers**: Customer registration and profile management
- **User Details**: Profile completion and status tracking
- **Protected**: Example protected routes
- **System**: Health checks and system endpoints

## API Endpoints Documentation

### Authentication Endpoints

#### 1. Send OTP
- **Endpoint**: `POST /api/auth/send-otp`
- **Description**: Sends a 6-digit OTP to the provided phone number
- **Authentication**: Not required
- **Request Body**: Phone number
- **Response**: OTP code and expiry information

#### 2. Verify OTP
- **Endpoint**: `POST /api/auth/verify-otp`
- **Description**: Verifies OTP and returns JWT token
- **Authentication**: Not required
- **Request Body**: Phone number, OTP, and optional user details
- **Response**: JWT token and user information

#### 3. Get Profile
- **Endpoint**: `GET /api/auth/profile`
- **Description**: Retrieves current user's profile
- **Authentication**: Required (Bearer token)
- **Response**: User profile information

#### 4. Logout
- **Endpoint**: `POST /api/auth/logout`
- **Description**: Invalidates current JWT token
- **Authentication**: Required (Bearer token)
- **Response**: Logout confirmation

#### 5. Logout All Devices
- **Endpoint**: `POST /api/auth/logout-all`
- **Description**: Invalidates all JWT tokens for the user
- **Authentication**: Required (Bearer token)
- **Response**: Logout confirmation

#### 6. Token Cleanup
- **Endpoint**: `POST /api/auth/cleanup-tokens`
- **Description**: Manually triggers cleanup of expired tokens
- **Authentication**: Required (Bearer token)
- **Response**: Cleanup statistics

### Customer Endpoints

#### 1. Register Customer
- **Endpoint**: `POST /api/customers/register`
- **Description**: Creates a new customer account
- **Authentication**: Not required
- **Request Body**: Customer name, email, and phone number
- **Response**: Created customer information

#### 2. Update Profile
- **Endpoint**: `PUT /api/customers/update-profile`
- **Description**: Updates customer profile information with comprehensive fields
- **Authentication**: Required (Bearer token)
- **Request Body**: Updated customer information (all fields optional)
- **Response**: Updated customer information with complete profile data

#### 3. Get All Customers
- **Endpoint**: `GET /api/customers/all`
- **Description**: Retrieves all customers (Admin function)
- **Authentication**: Required (Bearer token)
- **Response**: List of all customers

### User Details Endpoints

#### 1. Update Basic Details
- **Endpoint**: `PUT /api/user-details/basic-details`
- **Description**: Updates user's basic information (Step 1)
- **Authentication**: Required (Bearer token)
- **Request Body**: Basic user information
- **Response**: Updated user information

#### 2. Update Additional Details
- **Endpoint**: `PUT /api/user-details/additional-details`
- **Description**: Updates user's additional information (Step 2)
- **Authentication**: Required (Bearer token)
- **Request Body**: Additional user information
- **Response**: Updated user information

#### 3. Get Completion Status
- **Endpoint**: `GET /api/user-details/completion-status`
- **Description**: Retrieves user's profile completion status
- **Authentication**: Required (Bearer token)
- **Response**: Completion status and user information

#### 4. Complete Profile
- **Endpoint**: `PUT /api/user-details/complete-profile`
- **Description**: Completes user profile with all information
- **Authentication**: Required (Bearer token)
- **Request Body**: Complete user information
- **Response**: Completed user information

### Protected Endpoints

#### 1. Get User Info
- **Endpoint**: `GET /api/protected/user-info`
- **Description**: Example protected route with user information
- **Authentication**: Required (Bearer token)
- **Response**: User information from JWT token

#### 2. Get Dashboard
- **Endpoint**: `GET /api/protected/dashboard`
- **Description**: Example dashboard endpoint
- **Authentication**: Required (Bearer token)
- **Response**: Dashboard data with user information

### System Endpoints

#### 1. Health Check
- **Endpoint**: `GET /api/test/health`
- **Description**: Simple health check endpoint
- **Authentication**: Not required
- **Response**: API status and timestamp

## Schema Definitions

### Request Schemas

#### SendOTPRequest
```json
{
  "phone_number": "+1234567890"
}
```

#### VerifyOTPRequest
```json
{
  "phone_number": "1234567890",
  "otp": "123456"
}
```

#### CustomerRegistrationRequest
```json
{
  "customer_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890"
}
```

#### UpdateCustomerProfileRequest
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "email2": "john.alternate@example.com",
  "login_name": "johndoe",
  "mobile_phone1": "+1234567890",
  "mobile_phone2": "+1987654321",
  "home_phone": "+1555123456",
  "work_phone": "+1555987654",
  "work_phone_ext": "123",
  "gender": "male",
  "marital_status": "married",
  "date_of_birth": "1990-01-15",
  "national_id_no": "123456789",
  "other_id_no": "987654321",
  "national_id_expiry": "2030-12-31",
  "other_id_expiry": "2025-06-30",
  "comments": "Customer prefers SMS notifications"
}
```

#### UserDetailsRequest
```json
{
  "customer_name": "John Doe",
  "email": "john@example.com",
  "valid_until": "2024-12-31",
  "state": "active"
}
```

### Response Schemas

#### Customer
```json
{
  "id": 1,
  "customer_name": "John Doe",
  "email": "john@example.com",
  "login_domain": "+1234567890",
  "state": "active",
  "initial_login": false,
  "login_count": 5,
  "last_login": "2024-01-01T12:00:00.000Z",
  "valid_until": "2024-12-31T23:59:59.000Z",
  "create_date": "2024-01-01T00:00:00.000Z",
  "write_date": "2024-01-01T12:00:00.000Z"
}
```

#### LoginResponse
```json
{
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": 1,
    "customer_name": "John Doe",
    "email": "john@example.com",
    "login_domain": "+1234567890",
    "is_new_user": false
  }
}
```

#### LogoutResponse
```json
{
  "message": "Logout successful. Token has been invalidated.",
  "logoutTime": "2024-01-01T12:00:00.000Z"
}
```

## Authentication

### JWT Bearer Token
The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. **Login**: Use the `/api/auth/verify-otp` endpoint to get a JWT token
2. **Authorization**: Include the token in the `Authorization` header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```
3. **Token Expiry**: Tokens expire after 24 hours
4. **Logout**: Use logout endpoints to invalidate tokens

### Token Management
- **Individual Logout**: Invalidates current token
- **Logout All Devices**: Invalidates all tokens for the user
- **Automatic Cleanup**: Expired tokens are automatically cleaned up
- **Manual Cleanup**: Admin endpoint for manual token cleanup

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "message": "Validation error",
  "error": "Phone number is required"
}
```

#### 401 Unauthorized
```json
{
  "message": "Invalid token"
}
```

#### 403 Forbidden
```json
{
  "message": "Account is disabled!"
}
```

#### 404 Not Found
```json
{
  "message": "Customer not found!"
}
```

#### 409 Conflict
```json
{
  "message": "Email is already taken by another customer!"
}
```

#### 429 Too Many Requests
```json
{
  "message": "Rate limit exceeded"
}
```

#### 500 Internal Server Error
```json
{
  "message": "Error processing request"
}
```

## Testing with Swagger UI

### Getting Started
1. **Access Documentation**: Navigate to `http://localhost:3000/api-docs`
2. **Authorize**: Click the "Authorize" button and enter your JWT token
3. **Test Endpoints**: Use the "Try it out" button on any endpoint
4. **View Responses**: See real-time responses and error messages

### Testing Workflow
1. **Send OTP**: Use `/auth/send-otp` to get an OTP
2. **Login**: Use `/auth/verify-otp` to get a JWT token
3. **Authorize**: Enter the token in the Swagger UI
4. **Test Protected Endpoints**: Try protected endpoints with authentication

### Example Test Flow
```bash
# 1. Send OTP
curl -X POST "http://localhost:3000/api/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+1234567890"}'

# 2. Verify OTP and get token
curl -X POST "http://localhost:3000/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+1234567890", "otp": "123456"}'

# 3. Use token for protected endpoints
curl -X GET "http://localhost:3000/api/auth/profile" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Configuration

### Swagger Configuration
The Swagger configuration is located in `config/swagger.config.js` and includes:

- **API Information**: Title, version, description, contact info
- **Servers**: Development and production server URLs
- **Security Schemes**: JWT bearer token authentication
- **Schemas**: All request/response schemas
- **Tags**: Organized endpoint categories

### Customization Options
- **UI Customization**: Custom CSS, title, and favicon
- **Security**: Persistent authorization across sessions
- **Features**: Request duration, filtering, deep linking

## Development

### Adding New Endpoints
1. **Add Route**: Create the route in the appropriate router file
2. **Add Documentation**: Add JSDoc comments with `@swagger` annotations
3. **Define Schemas**: Add request/response schemas to `swagger.config.js`
4. **Test**: Verify documentation appears correctly in Swagger UI

### Example Endpoint Documentation
```javascript
/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: Example endpoint
 *     description: Example endpoint description
 *     tags: [Example]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExampleResponse'
 */
```

## Security Considerations

### API Security
- **HTTPS**: Use HTTPS in production
- **Rate Limiting**: Implemented on sensitive endpoints
- **Input Validation**: Comprehensive validation on all inputs
- **Error Handling**: Secure error messages without information leakage

### Documentation Security
- **Production URLs**: Use production URLs in production environment
- **Sensitive Data**: No sensitive data in documentation examples
- **Access Control**: Consider access control for documentation in production

## Troubleshooting

### Common Issues

#### Documentation Not Loading
- Check if Swagger dependencies are installed
- Verify the configuration file path
- Check server logs for errors

#### Authentication Issues
- Ensure JWT token is valid and not expired
- Check token format: `Bearer <token>`
- Verify token hasn't been invalidated

#### Schema Errors
- Check schema definitions in `swagger.config.js`
- Verify schema references are correct
- Test with valid request data

### Debugging
1. **Check Console**: Look for JavaScript errors in browser console
2. **Network Tab**: Check network requests in browser dev tools
3. **Server Logs**: Check application logs for errors
4. **Swagger UI**: Use browser dev tools to inspect Swagger UI

## Best Practices

### Documentation
- **Keep Updated**: Update documentation when API changes
- **Clear Descriptions**: Provide clear, concise descriptions
- **Examples**: Include realistic examples
- **Error Cases**: Document all possible error responses

### Testing
- **Test All Endpoints**: Verify all endpoints work as documented
- **Test Error Cases**: Test error scenarios
- **Test Authentication**: Verify authentication works correctly
- **Test Examples**: Ensure examples are valid

### Maintenance
- **Regular Reviews**: Review documentation regularly
- **Version Control**: Keep documentation in version control
- **Automation**: Consider automated documentation generation
- **Feedback**: Collect feedback from API users

## Conclusion

The Swagger documentation provides a comprehensive, interactive guide to the Lively API. It enables developers to understand, test, and integrate with the API efficiently. The documentation is automatically generated from code comments, ensuring it stays up-to-date with the actual implementation. 