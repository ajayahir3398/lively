# Logout Functionality

This document explains the logout functionality that has been implemented to invalidate JWT tokens.

## Overview

The logout system allows users to invalidate their JWT tokens, preventing them from being used for future API requests. This provides better security by allowing users to explicitly log out and invalidate their sessions.

## Features

### 1. Individual Logout
- **Endpoint**: `POST /api/auth/logout`
- **Authentication**: Required (Bearer token)
- **Description**: Invalidates the current JWT token
- **Response**: Confirmation that the token has been invalidated

### 2. Logout All Devices
- **Endpoint**: `POST /api/auth/logout-all`
- **Authentication**: Required (Bearer token)
- **Description**: Placeholder for invalidating all tokens for a user
- **Response**: Confirmation message

### 3. Token Cleanup
- **Endpoint**: `POST /api/auth/cleanup-tokens`
- **Authentication**: Required (Bearer token)
- **Description**: Removes expired tokens from the blacklist
- **Response**: Number of tokens cleaned up

### 4. Blacklist Statistics
- **Endpoint**: `GET /api/auth/blacklist-stats`
- **Authentication**: Required (Bearer token)
- **Description**: Retrieves statistics about the token blacklist
- **Response**: Total blacklisted tokens, max size, available slots, and last updated time

## Implementation Details

### JSON File Token Blacklist

The logout system uses a JSON file (`assets/token_blacklist.json`) to store blacklisted tokens. This approach provides:

- **Persistence**: Blacklist survives server restarts
- **Fast Performance**: In-memory Set with file persistence
- **Simple Management**: Easy to view and manage blacklisted tokens
- **Automatic Cleanup**: Expired tokens are automatically removed during cleanup

### File Structure

The blacklist is stored in `assets/token_blacklist.json` with the following structure:

```json
{
  "blacklisted_tokens": [
    {
      "token": "token1",
      "timestamp": 1704067200000
    },
    {
      "token": "token2", 
      "timestamp": 1704067300000
    }
  ],
  "last_updated": "2024-01-01T12:00:00.000Z",
  "total_blacklisted": 2,
  "max_size": 100
}
```

### Memory Management

The blacklist uses a JavaScript Set object in memory for fast access:
- O(1) lookup time for token validation
- Automatic deduplication of tokens
- Efficient memory usage
- Automatic file persistence
- Maximum limit of 100 tokens with automatic removal of oldest tokens

## How It Works

1. **Token Blacklisting**: When a user logs out, their token is added to the blacklist Set and saved to the JSON file
2. **Token Validation**: The auth middleware checks if a token exists in the blacklist before allowing access
3. **Persistence**: Blacklist is automatically loaded from JSON file on server startup
4. **Automatic Cleanup**: Expired tokens are automatically removed from the blacklist during cleanup operations
5. **Size Management**: When the blacklist reaches 100 tokens, the oldest tokens are automatically removed to make space for new ones

## Usage Examples

### Logout Request
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Response
```json
{
  "flag": true,
  "message": "Logout successful! Token has been invalidated.",
  "logoutTime": "2024-01-01T12:00:00.000Z"
}
```

## Security Benefits

1. **Explicit Logout**: Users can explicitly log out and invalidate their tokens
2. **Token Invalidation**: Blacklisted tokens cannot be used for API requests
3. **Session Control**: Provides better control over user sessions
4. **Security Audit**: Tracks when and why tokens were invalidated

## Implementation Details

### Files Modified/Created:

1. **`utils/tokenBlacklistManager.js`** - New utility for managing JSON file blacklist
2. **`assets/token_blacklist.json`** - JSON file to store blacklisted tokens
3. **`middleware/auth.middleware.js`** - Updated to use JSON file blacklist
4. **`services/auth.service.js`** - Updated logout functions to use JSON file blacklist
5. **`routes/auth.routes.js`** - Added logout routes and blacklist statistics

### Middleware Changes:

The auth middleware now checks if a token is blacklisted before allowing access:

```javascript
// Check if token is blacklisted
if (tokenBlacklistManager.isBlacklisted(cleanToken)) {
  return res.status(401).json({ 
    flag: false,
    message: 'Token has been invalidated' 
  });
}
```

## Setup Instructions

1. **Restart Application**: The new functionality will be available immediately
2. **Test Logout**: Use the logout endpoints to test the functionality

## Future Enhancements

1. **Single Token Per User**: Implement logic to invalidate previous tokens when a new one is generated
2. **Device Tracking**: Track which devices are using which tokens
3. **Force Logout**: Admin functionality to force logout specific users
4. **Token Analytics**: Track token usage patterns and security events

## Notes

- The current implementation only blacklists tokens when explicitly logged out
- The blacklist is stored in `assets/token_blacklist.json` and persists across server restarts
- To implement "only one valid token per user", additional logic would be needed in the token generation process
- The `logout-all` endpoint is currently a placeholder and would need additional implementation to track all active tokens
- For production use with multiple server instances, consider using Redis or a shared cache for the blacklist
- The JSON file approach is suitable for single-server deployments and provides easy debugging and management 