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
- **Activities**: Activity management with automatic image URL generation

### 🖼️ **Image URL Generation**
- **Automatic Attachment Processing**: Activities automatically include image URLs from attachments
- **Smart URL Construction**: URLs generated using `${ODOO_SERVER_URL}content/${attachment_id}` format
- **Null Handling**: `imageUrl` field is `null` when no attachments exist
- **Database Integration**: Seamlessly integrates with `ir_attachment` table using `res_id` and `res_model`
- **Performance Optimized**: Only fetches attachment IDs, not full attachment data

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
- **Description**: Verifies OTP and returns access token + sets refresh token cookie
- **Authentication**: Not required
- **Request Body**: Phone number, OTP, and optional user details
- **Response**: Access token and user information (refresh token set as HttpOnly cookie)

#### 3. Get Profile
- **Endpoint**: `GET /api/auth/profile`
- **Description**: Retrieves current user's profile
- **Authentication**: Required (Bearer token)
- **Response**: User profile information including date_of_birth

#### 4. Refresh Token
- **Endpoint**: `POST /api/auth/refresh-token`
- **Description**: Refreshes access token using refresh token from HttpOnly cookie
- **Authentication**: Not required (uses HttpOnly cookie)
- **Response**: New access token

#### 5. Logout
- **Endpoint**: `POST /api/auth/logout`
- **Description**: Invalidates access token and refresh token, clears cookies
- **Authentication**: Required (Bearer token or refresh cookie)
- **Response**: Logout confirmation

#### 6. Logout All Devices
- **Endpoint**: `POST /api/auth/logout-all`
- **Description**: Invalidates all refresh tokens/sessions for the user across all devices
- **Authentication**: Required (Bearer token)
- **Response**: Logout confirmation

#### 7. Token Cleanup
- **Endpoint**: `POST /api/auth/cleanup-tokens`
- **Description**: Manually triggers cleanup of expired tokens and sessions
- **Authentication**: Required (Bearer token)
- **Response**: Cleanup statistics for database tokens and sessions

#### 8. Blacklist Statistics
- **Endpoint**: `GET /api/auth/blacklist-stats`
- **Description**: Retrieves statistics about token blacklist and active sessions
- **Authentication**: Required (Bearer token)
- **Response**: Database statistics for tokens and sessions

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

### Activity Endpoints

#### 1. Get All Activities
- **Endpoint**: `GET /api/activity`
- **Description**: Retrieves all activities with optional filtering, pagination, and image URLs
- **Authentication**: Required (Bearer token)
- **Query Parameters**: 
  - `page` (optional): Page number for pagination (default: 1)
  - `limit` (optional): Records per page (default: 10)
  - `state` (optional): Filter by activity state
  - `code` (optional): Filter by activity code (partial match)
  - `name` (optional): Filter by activity name (partial match)
  - `sortBy` (optional): Sort field (id, name, code, state, create_date, write_date)
  - `sortOrder` (optional): Sort order (ASC, DESC)
- **Response**: List of activities with pagination info and imageUrl field
- **Features**: 
  - Automatic image URL generation from attachments
  - URL format: `${ODOO_SERVER_URL}content/${attachment_id}`
  - `imageUrl` is `null` if no attachments exist

#### 2. Get Activity by ID
- **Endpoint**: `GET /api/activity/{id}`
- **Description**: Retrieves a specific activity by its ID with image URL
- **Authentication**: Required (Bearer token)
- **Path Parameters**: `id` - Activity ID
- **Response**: Activity details with imageUrl field

#### 3. Get Activity by Code
- **Endpoint**: `GET /api/activity/code/{code}`
- **Description**: Retrieves a specific activity by its code with image URL
- **Authentication**: Required (Bearer token)
- **Path Parameters**: `code` - Activity code
- **Response**: Activity details with imageUrl field

#### 4. Get Activities by State
- **Endpoint**: `GET /api/activity/state/{state}`
- **Description**: Retrieves all activities with a specific state with image URLs
- **Authentication**: Required (Bearer token)
- **Path Parameters**: `state` - Activity state
- **Query Parameters**: 
  - `page` (optional): Page number for pagination
  - `limit` (optional): Records per page
- **Response**: List of activities with pagination info and imageUrl field

#### 5. Get Courses by Activity ID
- **Endpoint**: `GET /api/activity/{id}/courses`
- **Description**: Retrieves all courses associated with a specific activity
- **Authentication**: Required (Bearer token)
- **Path Parameters**: `id` - Activity ID
- **Query Parameters**: 
  - `page` (optional): Page number for pagination (default: 1)
  - `limit` (optional): Records per page (default: 10)
- **Response**: List of courses with pagination info and imageUrl field
- **Features**: 
  - Validates activity existence before fetching courses
  - Uses `course_id` field to find related courses
  - Returns 404 if no courses found for the activity
  - Automatic image URL generation from attachments
  - URL format: `${ODOO_SERVER_URL}content/${attachment_id}`
  - `imageUrl` is `null` if no attachments exist

#### 6. Get Quick Sessions by Activity ID
- **Endpoint**: `GET /api/activity/{id}/quick-sessions`
- **Description**: Retrieves all quick sessions associated with a specific activity
- **Authentication**: Required (Bearer token)
- **Path Parameters**: `id` - Activity ID
- **Query Parameters**: 
  - `page` (optional): Page number for pagination (default: 1)
  - `limit` (optional): Records per page (default: 10)
- **Response**: List of quick sessions with pagination info and imageUrl field
- **Features**: 
  - Validates activity existence before fetching quick sessions
  - Uses `quick_sess_id` field to find related quick sessions
  - Returns 404 if no quick sessions found for the activity
  - Automatic image URL generation from attachments
  - URL format: `${ODOO_SERVER_URL}content/${attachment_id}`
  - `imageUrl` is `null` if no attachments exist

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
  "write_date": "2024-01-01T12:00:00.000Z",
  "date_of_birth": "1990-01-15"
}
```

#### LoginResponse
```json
{
  "flag": true,
  "message": "Login successful!",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "hasBasicInfo": true
}
```

#### RefreshTokenResponse
```json
{
  "flag": true,
  "message": "Token refreshed successfully!",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### LogoutResponse
```json
{
  "flag": true,
  "message": "Logout successful! Tokens have been invalidated.",
  "logoutTime": "2024-01-01T12:00:00.000Z"
}
```

#### CleanupResponse
```json
{
  "flag": true,
  "message": "Cleanup completed! Removed 5 blacklisted tokens and 3 expired sessions.",
  "deletedCount": {
    "blacklistedTokens": 5,
    "expiredSessions": 3,
    "total": 8
  }
}
```

#### StatsResponse
```json
{
  "flag": true,
  "message": "Token and session statistics retrieved successfully",
  "stats": {
    "tokenBlacklist": {
      "total": 10,
      "expired": 2,
      "active": 8
    },
    "sessions": {
      "total": 25,
      "active": 15,
      "expired": 5,
      "inactive": 5
    },
    "lastUpdated": "2024-01-01T12:00:00.000Z"
  }
}
```

#### Activity
```json
{
  "id": 1,
  "name": "Customer Registration",
  "code": "CUST_REG",
  "description": "Customer registration process",
  "state": "active",
  "comments": "This activity handles customer registration",
  "create_date": "2024-01-01T12:00:00.000Z",
  "write_date": "2024-01-01T12:00:00.000Z",
  "imageUrl": "https://odoo-server.com/content/123"
}
```

#### ActivityListResponse
```json
{
  "flag": true,
  "message": "Activities retrieved successfully!",
  "data": [
    {
      "id": 1,
      "name": "Customer Registration",
      "code": "CUST_REG",
      "description": "Customer registration process",
      "state": "active",
      "comments": "This activity handles customer registration",
      "create_date": "2024-01-01T12:00:00.000Z",
      "write_date": "2024-01-01T12:00:00.000Z",
      "imageUrl": "https://odoo-server.com/content/123"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 47,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Course
```json
{
  "id": 1,
  "course_ref_id": 100,
  "course_id": 1,
  "name": "Introduction to Programming",
  "code": "PROG101",
  "description": "Basic programming concepts",
  "state": "active",
  "comments": "Beginner friendly course",
  "create_date": "2024-01-01T12:00:00.000Z",
  "write_date": "2024-01-01T12:00:00.000Z",
  "imageUrl": "https://odoo-server.com/content/123"
}
```

#### QuickSession
```json
{
  "id": 1,
  "sess_ref_id": 200,
  "quick_sess_id": 1,
  "name": "Quick Demo Session",
  "code": "DEMO001",
  "description": "Quick demonstration",
  "state": "active",
  "comments": "15-minute demo session",
  "create_date": "2024-01-01T12:00:00.000Z",
  "write_date": "2024-01-01T12:00:00.000Z",
  "imageUrl": "https://odoo-server.com/content/456"
}
```

## Authentication

### Access + Refresh Token Flow
The API uses a dual-token system with access and refresh tokens for enhanced security:

1. **Login**: Use the `/api/auth/verify-otp` endpoint to get an access token
2. **Authorization**: Include the access token in the `Authorization` header:
   ```
   Authorization: Bearer <your-access-token>
   ```
3. **Token Expiry**: 
   - **Access Token**: Expires after 15 minutes
   - **Refresh Token**: Expires after 7 days (stored as HttpOnly cookie)
4. **Token Refresh**: When access token expires, use `/api/auth/refresh-token` to get a new one
5. **Logout**: Use logout endpoints to invalidate tokens and clear cookies

### Token Types
- **Access Token**: Short-lived (15 min), used for API requests, stored in memory/localStorage
- **Refresh Token**: Long-lived (7 days), used to get new access tokens, stored as HttpOnly cookie

### Token Management
- **Individual Logout**: Invalidates current tokens and clears cookies
- **Logout All Devices**: Invalidates all refresh tokens/sessions for the user
- **Automatic Cleanup**: Expired tokens and sessions are automatically cleaned up
- **Manual Cleanup**: Admin endpoint for manual cleanup of database tokens and sessions
- **Session Tracking**: All active sessions are tracked in the database with device information

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
2. **Login**: Use `/auth/verify-otp` to get an access token (refresh token set as cookie)
3. **Authorize**: Enter the access token in the Swagger UI
4. **Test Protected Endpoints**: Try protected endpoints with authentication
5. **Token Refresh**: When access token expires, use `/auth/refresh-token` to get a new one
6. **Logout**: Use logout endpoints to clean up tokens and sessions

### Example Test Flow
```bash
# 1. Send OTP
curl -X POST "http://localhost:3000/api/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+1234567890"}'

# 2. Verify OTP and get access token
curl -X POST "http://localhost:3000/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+1234567890", "otp": "123456"}' \
  --cookie-jar cookies.txt

# 3. Use access token for protected endpoints
curl -X GET "http://localhost:3000/api/customer/profile" \
  -H "Authorization: Bearer <your-access-token>"

# 4. Refresh access token when expired
curl -X POST "http://localhost:3000/api/auth/refresh-token" \
  --cookie cookies.txt

# 5. Logout and clear tokens
curl -X POST "http://localhost:3000/api/auth/logout" \
  -H "Authorization: Bearer <your-access-token>" \
  --cookie cookies.txt
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
- **HTTPS**: Use HTTPS in production for secure cookie transmission
- **Rate Limiting**: Implemented on sensitive endpoints
- **Input Validation**: Comprehensive validation on all inputs
- **Error Handling**: Secure error messages without information leakage
- **HttpOnly Cookies**: Refresh tokens stored as HttpOnly cookies for XSS protection
- **Token Rotation**: Refresh tokens are rotated on each use for enhanced security
- **Database Storage**: All tokens and sessions tracked in database for proper management

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
- Ensure access token is valid and not expired (15 min expiry)
- Check token format: `Bearer <access-token>`
- Verify token hasn't been blacklisted in database
- If access token expired, use refresh token endpoint to get new one
- Ensure refresh token cookie is present for refresh requests

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
- **Test Error Cases**: Test error scenarios including token expiry
- **Test Authentication**: Verify both access and refresh token flows
- **Test Examples**: Ensure examples are valid
- **Test Token Refresh**: Verify automatic token refresh works
- **Test Session Management**: Test logout and logout-all functionality
- **Test Cookie Handling**: Verify HttpOnly cookies work correctly

### Maintenance
- **Regular Reviews**: Review documentation regularly
- **Version Control**: Keep documentation in version control
- **Automation**: Consider automated documentation generation
- **Feedback**: Collect feedback from API users

## Conclusion

The Swagger documentation provides a comprehensive, interactive guide to the Lively API with modern access + refresh token authentication. It enables developers to understand, test, and integrate with the API efficiently using secure token management practices. The documentation is automatically generated from code comments, ensuring it stays up-to-date with the actual implementation including the dual-token authentication system and database-backed session management. 