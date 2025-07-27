# Logout Functionality Implementation

This document describes the logout functionality implemented in the application, which provides secure token invalidation and management.

## Overview

The logout system uses a token invalidation approach where JWT tokens are stored in an `invalidated_tokens` array in the customer database. This ensures that logged-out tokens cannot be reused, even if they haven't expired yet.

## Features

### 1. Individual Logout
- Invalidates the current user's token
- Token is added to the `invalidated_tokens` list
- User must login again to get a new token

### 2. Logout All Devices
- Invalidates all tokens for the user
- Clears the `invalidated_tokens` array
- Forces logout from all devices/sessions

### 3. Automatic Token Cleanup
- Scheduled cleanup of expired tokens
- Runs every 60 minutes by default
- Removes expired tokens from the invalidated list

### 4. Manual Token Cleanup
- Admin endpoint to manually trigger cleanup
- Useful for maintenance and debugging

## Database Changes

### Customer Model
Added `invalidated_tokens` field:
```javascript
invalidated_tokens: {
  type: Sequelize.TEXT,
  comment: 'Invalidated JWT tokens (JSON array)',
  defaultValue: '[]'
}
```

## API Endpoints

### 1. Logout User
```
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logout successful. Token has been invalidated.",
  "logoutTime": "2024-01-01T12:00:00.000Z"
}
```

### 2. Logout All Devices
```
POST /api/auth/logout-all
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logged out from all devices successfully.",
  "logoutTime": "2024-01-01T12:00:00.000Z"
}
```

### 3. Manual Token Cleanup
```
POST /api/auth/cleanup-tokens
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Token cleanup completed successfully",
  "totalCleaned": 5,
  "usersProcessed": 10
}
```

## Authentication Middleware Updates

The authentication middleware now checks for invalidated tokens:

1. **Token Validation**: Verifies JWT token signature and expiration
2. **User Validation**: Ensures user exists and account is active
3. **Token Invalidation Check**: Checks if token is in the invalidated list
4. **Account Status Check**: Verifies account is not disabled or blocked

## Implementation Details

### Token Storage
- Tokens are stored as JSON array in the `invalidated_tokens` field
- Each token is stored as a string
- Array is parsed and stringified when reading/writing

### Cleanup Process
1. **Scheduled Cleanup**: Runs every 60 minutes automatically
2. **Manual Cleanup**: Can be triggered via API endpoint
3. **Login Cleanup**: Clears invalidated tokens on successful login

### Security Features
- **Token Invalidation**: Prevents reuse of logged-out tokens
- **Account Status**: Checks for disabled/blocked accounts
- **Expiration Handling**: Properly handles expired tokens
- **Error Handling**: Comprehensive error handling and logging

## Usage Examples

### Frontend Integration

```javascript
// Logout current session
const logout = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      // Clear local token
      localStorage.removeItem('token');
      // Redirect to login
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// Logout all devices
const logoutAllDevices = async () => {
  try {
    const response = await fetch('/api/auth/logout-all', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      // Clear local token
      localStorage.removeItem('token');
      // Show message to user
      alert('Logged out from all devices');
    }
  } catch (error) {
    console.error('Logout all failed:', error);
  }
};
```

### Testing

Use the provided test file to verify functionality:

```bash
node test-logout.js
```

## Configuration

### Environment Variables
- `JWT_SECRET`: Secret key for JWT token signing
- Default: `'your-secret-key'` (change in production)

### Cleanup Schedule
- Default: Every 60 minutes
- Configurable in `app.js`:
```javascript
const cleanupInterval = scheduleTokenCleanup(60); // 60 minutes
```

## Security Considerations

1. **Token Storage**: Tokens are stored in database for invalidation tracking
2. **Cleanup**: Expired tokens are automatically removed
3. **Validation**: Multiple layers of token validation
4. **Error Handling**: Comprehensive error handling prevents information leakage

## Troubleshooting

### Common Issues

1. **Token Not Invalidated**
   - Check if token is properly stored in `invalidated_tokens`
   - Verify database connection

2. **Cleanup Not Working**
   - Check scheduled cleanup is running
   - Verify database permissions
   - Check application logs

3. **Authentication Errors**
   - Verify JWT_SECRET is set correctly
   - Check token format in Authorization header
   - Ensure user account is not disabled/blocked

### Debugging

Enable detailed logging by checking:
- Application console logs
- Database queries
- Token validation errors

## Migration Notes

If upgrading from a previous version:

1. **Database Migration**: Add `invalidated_tokens` column to `lp_customer_login` table
2. **Default Value**: Set default value to `'[]'` for existing records
3. **Testing**: Verify logout functionality works with existing tokens

## Performance Considerations

1. **Token Array Size**: Monitor `invalidated_tokens` array size
2. **Cleanup Frequency**: Adjust cleanup schedule based on usage
3. **Database Indexing**: Consider indexing on `invalidated_tokens` for large datasets
4. **Memory Usage**: Monitor memory usage during cleanup operations 