# Lively Customer Login API

A Node.js Express API with OTP-based authentication for customer login using PostgreSQL.

## Features

- OTP-based authentication (6-digit OTP)
- JWT token generation and verification
- PostgreSQL database integration with Sequelize ORM
- Security middleware (Helmet, CORS)
- Account status validation (disabled, blocked)
- Input validation with express-validator
- Rate limiting for API endpoints
- Customer registration and profile management

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Database Setup

Ensure your PostgreSQL database is running and the `lp_customer_login` table exists with the provided schema.

### 4. Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### 1. Send OTP
- **POST** `/api/auth/send-otp`
- **Body:**
  ```json
  {
    "phone_number": "1234567890"
  }
  ```
- **Validation:**
  - Phone number is required
  - Must be a valid mobile phone number
  - Rate limited to 5 requests per minute
- **Response:**
  ```json
  {
    "flag": true,
    "message": "OTP sent successfully!"
  }
  ```
- **Note:** Creates a fresh user if phone number doesn't exist
- **Error Response:**
  ```json
  {
    "message": "Validation failed",
    "errors": [
      {
        "field": "phone_number",
        "message": "Please provide a valid phone number",
        "value": "invalid"
      }
    ]
  }
  ```

#### 2. Verify OTP and Login
- **POST** `/api/auth/verify-otp`
- **Body:**
  ```json
  {
    "phone_number": "1234567890",
    "otp": "123456"
  }
  ```
- **Validation:**
  - Phone number is required and must be valid
  - OTP is required and must be exactly 6 digits
  - Rate limited to 5 requests per minute
- **Response:**
  ```json
  {
    "message": "Login successful!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "customer": {
      "id": 1,
      "customer_name": "John Doe",
      "email": "john@example.com",
      "login_domain": "1234567890",
      "is_new_user": true
    }
  }
  ```
- **Note:** `is_new_user` indicates if this is a fresh user who needs to complete profile

#### 3. Get Customer Profile (Protected)
- **GET** `/api/auth/profile`
- **Headers:**
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Response:**
  ```json
  {
    "customer": {
      "id": 1,
      "customer_name": "John Doe",
      "email": "john@example.com",
      "login_domain": "1234567890",
      "login_count": 5,
      "last_login": "2024-01-15T10:30:00.000Z"
    },
    "user": {
      "id": 1,
      "customer_name": "John Doe",
      "email": "john@example.com",
      "login_domain": "1234567890"
    }
  }
  ```

### User Details Management (Step-by-Step)

#### 1. Update Basic Details (Step 1)
- **PUT** `/api/user-details/basic-details`
- **Headers:**
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Body:**
  ```json
  {
    "customer_name": "John Doe",
    "email": "john@example.com"
  }
  ```
- **Validation:**
  - Customer name is optional (2-100 characters if provided)
  - Email is optional and must be valid if provided
  - Rate limited to 5 requests per minute
- **Response:**
  ```json
  {
    "message": "Basic details updated successfully!",
    "customer": {
      "id": 1,
      "customer_name": "John Doe",
      "email": "john@example.com",
      "login_domain": "1234567890",
      "initial_login": false
    }
  }
  ```

#### 2. Update Additional Details (Step 2)
- **PUT** `/api/user-details/additional-details`
- **Headers:**
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Body:**
  ```json
  {
    "customer_name": "John Doe",
    "email": "john@example.com",
    "valid_until": "2024-12-31T23:59:59.000Z",
    "state": "active"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Additional details updated successfully!",
    "customer": {
      "id": 1,
      "customer_name": "John Doe",
      "email": "john@example.com",
      "login_domain": "1234567890",
      "valid_until": "2024-12-31T23:59:59.000Z",
      "state": "active",
      "initial_login": false
    }
  }
  ```

#### 3. Get Completion Status
- **GET** `/api/user-details/completion-status`
- **Headers:**
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Response:**
  ```json
  {
    "customer": {
      "id": 1,
      "customer_name": "John Doe",
      "email": "john@example.com",
      "login_domain": "1234567890",
      "valid_until": "2024-12-31T23:59:59.000Z",
      "state": "active",
      "initial_login": false
    },
    "completion_status": {
      "basic_details": true,
      "additional_details": true,
      "profile_complete": true,
      "initial_login": false
    }
  }
  ```

#### 4. Complete Profile (All at Once)
- **PUT** `/api/user-details/complete-profile`
- **Headers:**
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Body:**
  ```json
  {
    "customer_name": "John Doe",
    "email": "john@example.com",
    "valid_until": "2024-12-31T23:59:59.000Z",
    "state": "active"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Profile completed successfully!",
    "customer": {
      "id": 1,
      "customer_name": "John Doe",
      "email": "john@example.com",
      "login_domain": "1234567890",
      "valid_until": "2024-12-31T23:59:59.000Z",
      "state": "active",
      "initial_login": false
    }
  }
  ```

### Customer Management

#### 1. Register Customer
- **POST** `/api/customers/register`
- **Body:**
  ```json
  {
    "customer_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "1234567890"
  }
  ```
- **Validation:**
  - Customer name is required (2-100 characters)
  - Email is required and must be valid
  - Phone number is required and must be valid
  - Rate limited to 5 requests per minute
- **Response:**
  ```json
  {
    "message": "Customer registered successfully!",
    "customer": {
      "id": 1,
      "customer_name": "John Doe",
      "email": "john@example.com",
      "login_domain": "1234567890"
    }
  }
  ```

#### 2. Update Profile (Protected)
- **PUT** `/api/customers/update-profile`
- **Headers:**
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Body:**
  ```json
  {
    "name": "John Updated",
    "email": "john.updated@example.com",
    "email2": "john.alternate@example.com",
    "login_name": "johnupdated",
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
- **Validation:**
  - All fields are optional
  - Name must be 2-60 characters if provided
  - Email addresses must be valid if provided
  - Phone numbers must be valid if provided
  - Gender must be male, female, or other
  - Marital status must be single, married, divorced, widowed, or separated
  - Dates must be in YYYY-MM-DD format
  - Rate limited to 5 requests per minute
- **Response:**
  ```json
  {
    "flag": true,
    "message": "Customer profile updated successfully!",
    "data": {
      "id": 1,
      "phone_number": "1234567890",
      "name": "John Updated",
      "email": "john.updated@example.com",
      "email2": "john.alternate@example.com",
      "login_name": "johnupdated",
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
      "comments": "Customer prefers SMS notifications",
      "state": "active",
      "login_count": 5,
      "last_login": "2024-01-15T10:30:00.000Z",
      "date_signed_up": "2024-01-01T00:00:00.000Z",
      "last_activity_date": "2024-01-15T10:30:00.000Z",
      "has_basic_info": true
    }
  }
  ```

#### 3. Get All Customers (Protected)
- **GET** `/api/customers/all`
- **Headers:**
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Response:**
  ```json
  {
    "customers": [
      {
        "id": 1,
        "customer_name": "John Doe",
        "email": "john@example.com",
        "login_domain": "1234567890",
        "state": "active",
        "create_date": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
  ```

### Test

#### Health Check
- **GET** `/api/test/health`
- **Response:**
  ```json
  {
    "message": "API is running!",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
  ```

### Protected Routes

#### User Info
- **GET** `/api/protected/user-info`
- **Headers:**
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Response:**
  ```json
  {
    "message": "Protected route accessed successfully!",
    "user": {
      "id": 1,
      "customer_name": "John Doe",
      "email": "john@example.com",
      "login_domain": "1234567890"
    },
    "userId": 1
  }
  ```

#### Dashboard
- **GET** `/api/protected/dashboard`
- **Headers:**
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Response:**
  ```json
  {
    "message": "Welcome John Doe!",
    "dashboard": {
      "user_id": 1,
      "customer_name": "John Doe",
      "email": "john@example.com",
      "login_domain": "1234567890",
      "last_accessed": "2024-01-15T10:30:00.000Z"
    }
  }
  ```

## Authentication Flow

1. **Send OTP**: Customer provides phone number, system generates 6-digit OTP
2. **Verify OTP**: Customer provides OTP, system verifies and returns JWT token
3. **Protected Routes**: Use JWT token in Authorization header for protected endpoints

## Security Features

- JWT token authentication
- OTP expiration (10 minutes)
- Account status validation
- Failed login tracking
- Security headers (Helmet)
- CORS protection
- Input validation and sanitization
- Rate limiting (5 requests per minute per endpoint)
- SQL injection prevention
- XSS protection

## Database Schema

The API uses the `lp_customer_login` table with the following key fields:
- `id`: Primary key
- `login_domain`: Phone number/domain
- `email`: Email address
- `customer_name`: Customer name
- `temp_pwd`: OTP storage (temporary)
- `temp_pwd_expiry`: OTP expiration
- `login_count`: Login attempts
- `failed_login_count`: Failed login attempts
- `login_disabled`: Account disabled flag
- `state`: Account status

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `201`: Created (customer registration)
- `400`: Bad Request (validation errors, missing parameters)
- `401`: Unauthorized (invalid token)
- `403`: Forbidden (account disabled/blocked)
- `404`: Not Found (customer not found)
- `409`: Conflict (duplicate email/phone number)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

### Validation Error Format
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "phone_number",
      "message": "Please provide a valid phone number",
      "value": "invalid"
    }
  ]
}
```

## Development Notes

- OTP is currently returned in the response for testing purposes
- In production, implement SMS service integration
- JWT secret should be changed in production
- Add rate limiting for OTP requests
- Implement proper logging
- Add input validation middleware 