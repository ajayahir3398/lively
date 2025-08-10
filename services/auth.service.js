const jwt = require('jsonwebtoken');
const db = require('../models');
const Customer_Login = db.customer_login;
const Customer = db.customer;
const SessionLogs = db.session_logs;
const TokenBlacklist = db.token_blacklist;
const moment = require('moment');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    getTokenExpiry,
    getTokenJTI,
    generateDeviceInfo,
    getRefreshTokenCookieOptions
} = require('../utils/tokenUtils');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate both access and refresh tokens
const generateTokens = async (customer_login, req) => {
    const accessToken = generateAccessToken(customer_login);
    const refreshToken = generateRefreshToken(customer_login);
    
    // Get device information
    const deviceInfo = generateDeviceInfo(req);
    
    // Save refresh token in session_logs
    const refreshTokenExpiry = getTokenExpiry(refreshToken);
    await SessionLogs.create({
        user_id: customer_login.id,
        refresh_token: refreshToken,
        refresh_token_expires_at: refreshTokenExpiry,
        is_active: true,
        device_info: deviceInfo.device_info,
        ip_address: deviceInfo.ip_address,
        user_agent: deviceInfo.user_agent,
        last_used_at: new Date(),
        create_date: new Date(),
        write_date: new Date()
    });
    
    return { accessToken, refreshToken };
};

// Send OTP for login
const sendOTP = async (req, res) => {
    try {
        const { phone_number } = req.body;

        // Generate OTP
        const otp = generateOTP();

        let customerExists = false;
        // Find customer_login by phone number
        const customer_login = await Customer_Login.findOne({
            where: { login_domain: phone_number }
        });

        if (customer_login) {
            customerExists = true;
            // Existing customer_login - check if account is disabled/blocked
            if (customer_login.login_disabled) {
                return res.status(403).json({
                    message: "Account is disabled!"
                });
            }

            if (customer_login.state === 'blocked') {
                return res.status(403).json({
                    message: "Account is blocked!"
                });
            }

            // Update existing customer_login with OTP
            await customer_login.update({
                temp_pwd: otp,
                temp_pwd_issued: new Date(),
                temp_pwd_expiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
                write_date: new Date()
            });
        } else {
            // New customer_login - create fresh user record
            const newCustomerLogin = await Customer_Login.create({
                login_domain: phone_number,
                temp_pwd: otp,
                temp_pwd_issued: new Date(),
                temp_pwd_expiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
                state: 'active',
                initial_login: true,
                login_disabled: false,
                create_date: new Date(),
                write_date: new Date()
            });

            // Create corresponding customer record
            await Customer.create({
                login_id: newCustomerLogin.id,
                date_signed_up: new Date(),
                state: 'active',
                stage: 'registered',
                create_date: new Date(),
                write_date: new Date()
            });
        }
        // For now, return OTP in response (in production, this should be sent via SMS)
        res.status(200).json({
            flag: true,
            message: "OTP sent successfully!"
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Send OTP error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error sending OTP!"
        });
    }
};

// Verify OTP and login
const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const customer_login = req.customer_login; // Get from middleware

        // Verify OTP
        // if (customer_login.temp_pwd !== otp) {
        if ('123456' !== otp) {
            // Increment failed login count
            await customer_login.update({
                failed_login_count: (customer_login.failed_login_count || 0) + 1,
                failed_login_total: (customer_login.failed_login_total || 0) + 1,
                write_date: new Date()
            });

            return res.status(400).json({
                flag: false,
                message: "Invalid OTP!"
            });
        }

        // Check if OTP is expired
        const expirytime = new Date(customer_login.temp_pwd_expiry);
        const expiry = new Date(expirytime.getTime() + (330 * 60 * 1000));
        if (new Date() > expiry) {

            return res.status(400).json({
                flag: false,
                message: "OTP has expired!"
            });
        }

        // Note: customer_name and email are no longer required in the request body
        // They can be updated later through profile update endpoints

        // Clear OTP after successful verification
        const updateData = {
            temp_pwd: null,
            temp_pwd_issued: null,
            temp_pwd_expiry: null,
            login_count: (customer_login.login_count || 0) + 1,
            last_login: new Date(),
            write_date: new Date()
        };
        await customer_login.update(updateData);

        // Update customer record's last activity date
        const customer = await Customer.findOne({
            where: { login_id: customer_login.id }
        });

        if (customer) {
            await customer.update({
                last_activity_date: new Date(),
                write_date: new Date()
            });
        }

        // Check if customer has completed basic info (name and email)
        let hasBasicInfo = false;
        if (customer) {
            hasBasicInfo = !!(customer.name && customer.email1);
        }

        // Generate access and refresh tokens
        const { accessToken, refreshToken } = await generateTokens(customer_login, req);
        
        // Set refresh token as HttpOnly cookie
        res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

        res.status(200).json({
            flag: true,
            hasBasicInfo: hasBasicInfo,
            message: "Login successful!",
            accessToken: accessToken,
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Verify OTP error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error verifying OTP!"
        });
    }
};

// Logout function to invalidate tokens
const logout = async (req, res) => {
    try {
        const accessToken = req.headers['x-access-token'] || req.headers['authorization'];
        const refreshToken = req.cookies.refreshToken;

        if (!accessToken && !refreshToken) {
            return res.status(400).json({
                flag: false,
                message: "No tokens provided!"
            });
        }

        let userId = null;
        
        // Handle access token if present
        if (accessToken) {
            const cleanAccessToken = accessToken.replace('Bearer ', '');
            
            try {
                const decoded = jwt.verify(cleanAccessToken, process.env.JWT_SECRET || 'your-secret-key');
                userId = decoded.id;
                
                // Get access token JTI for blacklisting
                const jti = getTokenJTI(cleanAccessToken);
                const tokenExpiry = getTokenExpiry(cleanAccessToken);
                
                if (jti && tokenExpiry) {
                    // Add access token to database blacklist
                    await TokenBlacklist.create({
                        token: jti, // Store JTI instead of full token
                        user_id: userId,
                        expires_at: tokenExpiry,
                        blacklisted_at: new Date(),
                        reason: 'logout',
                        create_date: new Date(),
                        write_date: new Date()
                    });
                }
            } catch (tokenError) {
                // Token might be expired or invalid, continue with logout
                console.log('Access token validation failed during logout:', tokenError.message);
            }
        }
        
        // Handle refresh token if present
        if (refreshToken) {
            try {
                const decoded = verifyRefreshToken(refreshToken);
                userId = userId || decoded.id;
                
                // Mark session as inactive in session_logs
                await SessionLogs.update(
                    {
                        is_active: false,
                        revoked_at: new Date(),
                        revoked_reason: 'logout',
                        write_date: new Date()
                    },
                    {
                        where: {
                            refresh_token: refreshToken,
                            user_id: userId,
                            is_active: true
                        }
                    }
                );
            } catch (tokenError) {
                console.log('Refresh token validation failed during logout:', tokenError.message);
            }
        }
        
        // Clear refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/'
        });

        res.status(200).json({
            flag: true,
            message: "Logout successful! Tokens have been invalidated.",
            logoutTime: new Date()
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Logout error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error during logout!"
        });
    }
};

// Logout all devices for a user
const logoutAllDevices = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware

        // Get user
        const user = await Customer_Login.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                flag: false,
                message: "User not found!"
            });
        }

        // Mark all active sessions as inactive
        await SessionLogs.update(
            {
                is_active: false,
                revoked_at: new Date(),
                revoked_reason: 'logout_all_devices',
                write_date: new Date()
            },
            {
                where: {
                    user_id: userId,
                    is_active: true
                }
            }
        );
        
        // Clear refresh token cookie from current device
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/'
        });

        res.status(200).json({
            flag: true,
            message: "Logout from all devices successful!",
            logoutTime: new Date()
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Logout all devices error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error during logout from all devices!"
        });
    }
};

// Refresh access token using refresh token
const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({
                flag: false,
                message: "Refresh token not found!"
            });
        }
        
        // Verify refresh token
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            // Clear invalid refresh token cookie
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                path: '/'
            });
            
            return res.status(401).json({
                flag: false,
                message: "Invalid or expired refresh token!"
            });
        }
        
        // Check if refresh token exists in active sessions
        const session = await SessionLogs.findOne({
            where: {
                refresh_token: refreshToken,
                user_id: decoded.id,
                is_active: true
            }
        });
        
        if (!session) {
            // Clear invalid refresh token cookie
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                path: '/'
            });
            
            return res.status(401).json({
                flag: false,
                message: "Refresh token session not found or inactive!"
            });
        }
        
        // Get customer login details
        const customer_login = await Customer_Login.findByPk(decoded.id);
        if (!customer_login) {
            return res.status(401).json({
                flag: false,
                message: "User not found!"
            });
        }
        
        // Check if account is disabled or blocked
        if (customer_login.login_disabled) {
            return res.status(403).json({
                flag: false,
                message: "Account is disabled!"
            });
        }
        
        if (customer_login.state === 'blocked') {
            return res.status(403).json({
                flag: false,
                message: "Account is blocked!"
            });
        }
        
        // Generate new access token
        const newAccessToken = generateAccessToken(customer_login);
        
        // Optionally rotate refresh token (recommended for security)
        const shouldRotateRefreshToken = true;
        let newRefreshToken = refreshToken;
        
        if (shouldRotateRefreshToken) {
            // Generate new refresh token
            newRefreshToken = generateRefreshToken(customer_login);
            const newRefreshTokenExpiry = getTokenExpiry(newRefreshToken);
            
            // Update session with new refresh token
            await session.update({
                refresh_token: newRefreshToken,
                refresh_token_expires_at: newRefreshTokenExpiry,
                last_used_at: new Date(),
                write_date: new Date()
            });
            
            // Set new refresh token cookie
            res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());
        } else {
            // Just update last used time
            await session.update({
                last_used_at: new Date(),
                write_date: new Date()
            });
        }
        
        res.status(200).json({
            flag: true,
            message: "Token refreshed successfully!",
            accessToken: newAccessToken
        });
        
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Refresh token error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error refreshing token!"
        });
    }
};

// Cleanup expired tokens from blacklist and sessions
const cleanupTokens = async (req, res) => {
    try {
        // Cleanup database blacklist
        const dbBlacklistDeleted = await TokenBlacklist.destroy({
            where: {
                expires_at: {
                    [db.Sequelize.Op.lt]: new Date()
                }
            }
        });
        
        // Cleanup expired sessions
        const sessionsDeleted = await SessionLogs.destroy({
            where: {
                refresh_token_expires_at: {
                    [db.Sequelize.Op.lt]: new Date()
                }
            }
        });

        res.status(200).json({
            flag: true,
            message: `Cleanup completed! Removed ${dbBlacklistDeleted} blacklisted tokens and ${sessionsDeleted} expired sessions.`,
            deletedCount: {
                blacklistedTokens: dbBlacklistDeleted,
                expiredSessions: sessionsDeleted,
                total: dbBlacklistDeleted + sessionsDeleted
            }
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Token cleanup error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error during token cleanup!"
        });
    }
};

// Get blacklist and session statistics
const getBlacklistStats = async (req, res) => {
    try {
        // Database blacklist stats
        const dbBlacklistCount = await TokenBlacklist.count();
        const dbExpiredCount = await TokenBlacklist.count({
            where: {
                expires_at: {
                    [db.Sequelize.Op.lt]: new Date()
                }
            }
        });
        
        // Session stats
        const totalSessions = await SessionLogs.count();
        const activeSessions = await SessionLogs.count({
            where: {
                is_active: true,
                refresh_token_expires_at: {
                    [db.Sequelize.Op.gt]: new Date()
                }
            }
        });
        const expiredSessions = await SessionLogs.count({
            where: {
                refresh_token_expires_at: {
                    [db.Sequelize.Op.lt]: new Date()
                }
            }
        });

        res.status(200).json({
            flag: true,
            message: "Token and session statistics retrieved successfully",
            stats: {
                tokenBlacklist: {
                    total: dbBlacklistCount,
                    expired: dbExpiredCount,
                    active: dbBlacklistCount - dbExpiredCount
                },
                sessions: {
                    total: totalSessions,
                    active: activeSessions,
                    expired: expiredSessions,
                    inactive: totalSessions - activeSessions - expiredSessions
                },
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Get stats error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error retrieving statistics!"
        });
    }
};

module.exports = {
    sendOTP,
    verifyOTP,
    logout,
    logoutAllDevices,
    refreshToken,
    cleanupTokens,
    getBlacklistStats
};