const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Token configurations
const ACCESS_TOKEN_EXPIRY = '60d'; // 60 days as per documentation
const REFRESH_TOKEN_EXPIRY = '60d'; // 60 days as per documentation 

/**
 * Generate access token (short-lived)
 * @param {Object} customer_login - Customer login object
 * @returns {String} Access token
 */
const generateAccessToken = (customer_login) => {
    const payload = {
        id: customer_login.id,
        customer_name: customer_login.customer_name,
        email: customer_login.email,
        login_domain: customer_login.login_domain,
        type: 'access'
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: ACCESS_TOKEN_EXPIRY,
        jwtid: crypto.randomUUID() // Add jti for blacklisting
    });
};

/**
 * Generate refresh token (long-lived)
 * @param {Object} customer_login - Customer login object
 * @returns {String} Refresh token
 */
const generateRefreshToken = (customer_login) => {
    const payload = {
        id: customer_login.id,
        login_domain: customer_login.login_domain,
        type: 'refresh'
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret-key', {
        expiresIn: REFRESH_TOKEN_EXPIRY,
        jwtid: crypto.randomUUID()
    });
};

/**
 * Verify access token
 * @param {String} token - Access token to verify
 * @returns {Object} Decoded token payload
 */
const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
};

/**
 * Verify refresh token
 * @param {String} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret-key');
};

/**
 * Decode token without verification (for getting expiry info)
 * @param {String} token - Token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
    return jwt.decode(token, { complete: true });
};

/**
 * Get token expiry date
 * @param {String} token - Token to get expiry from
 * @returns {Date} Expiry date
 */
const getTokenExpiry = (token) => {
    const decoded = decodeToken(token);
    if (decoded && decoded.payload && decoded.payload.exp) {
        return new Date(decoded.payload.exp * 1000);
    }
    return null;
};

/**
 * Extract JTI (JWT ID) from token
 * @param {String} token - Token to extract JTI from
 * @returns {String|null} JTI or null if not found
 */
const getTokenJTI = (token) => {
    const decoded = decodeToken(token);
    if (decoded && decoded.payload && decoded.payload.jti) {
        return decoded.payload.jti;
    }
    return null;
};

/**
 * Generate device fingerprint for session tracking
 * @param {Object} req - Express request object
 * @returns {Object} Device information
 */
const generateDeviceInfo = (req) => {
    const userAgent = req.get('user-agent') || '';
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                     (req.connection.socket ? req.connection.socket.remoteAddress : null) || 'unknown';
    
    // Create a basic device fingerprint
    const deviceInfo = {
        browser: extractBrowserInfo(userAgent),
        os: extractOSInfo(userAgent),
        isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
        language: req.get('accept-language') || 'unknown'
    };

    return {
        device_info: JSON.stringify(deviceInfo),
        ip_address: ipAddress,
        user_agent: userAgent
    };
};

/**
 * Extract browser information from user agent
 * @param {String} userAgent - User agent string
 * @returns {String} Browser name
 */
const extractBrowserInfo = (userAgent) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
};

/**
 * Extract OS information from user agent
 * @param {String} userAgent - User agent string
 * @returns {String} OS name
 */
const extractOSInfo = (userAgent) => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown';
};

/**
 * Set refresh token cookie options
 * @returns {Object} Cookie options
 */
const getRefreshTokenCookieOptions = () => {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        path: '/'
    };
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken,
    getTokenExpiry,
    getTokenJTI,
    generateDeviceInfo,
    getRefreshTokenCookieOptions,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY
};
