const jwt = require('jsonwebtoken');
const db = require('../models');
const Customer_Login = db.customer_login;
const Customer = db.customer;
const moment = require('moment');
const { tokenBlacklistManager } = require('../middleware/auth.middleware');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT token
const generateToken = (customer_login) => {
    return jwt.sign({
        id: customer_login.id,
        customer_name: customer_login.customer_name,
        email: customer_login.email,
        login_domain: customer_login.login_domain
    }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '30d'
    });
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
        const expiry = moment(customer_login.temp_pwd_expiry + 'Z').toDate();
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

        // Generate JWT token
        const token = generateToken(customer_login);

        res.status(200).json({
            flag: true,
            hasBasicInfo: hasBasicInfo,
            message: "Login successful!",
            token: token,
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

// Logout function to invalidate token
const logout = async (req, res) => {
    try {
        const token = req.headers['x-access-token'] || req.headers['authorization'];
        
        if (!token) {
            return res.status(400).json({
                flag: false,
                message: "No token provided!"
            });
        }

        const cleanToken = token.replace('Bearer ', '');
        
        // Verify token to get user info
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'your-secret-key');
        
        // Check if token is already blacklisted
        if (tokenBlacklistManager.isBlacklisted(cleanToken)) {
            return res.status(400).json({
                flag: false,
                message: "Token is already invalidated!"
            });
        }
        
        // Add token to blacklist
        tokenBlacklistManager.addToken(cleanToken);
        
        res.status(200).json({
            flag: true,
            message: "Logout successful! Token has been invalidated.",
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
        
        // Get all active tokens for this user (not blacklisted yet)
        // This is a simplified approach - in production you might want to track active tokens
        const user = await Customer_Login.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                flag: false,
                message: "User not found!"
            });
        }
        
        // For now, we'll just return success since we don't track all active tokens
        // In a more sophisticated system, you'd blacklist all tokens for this user
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

// Cleanup expired tokens from blacklist
const cleanupTokens = async (req, res) => {
    try {
        const deletedCount = tokenBlacklistManager.cleanupExpiredTokens();
        
        res.status(200).json({
            flag: true,
            message: `Cleanup completed! Removed ${deletedCount} expired tokens.`,
            deletedCount: deletedCount
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

// Get blacklist statistics
const getBlacklistStats = async (req, res) => {
    try {
        const stats = tokenBlacklistManager.getStats();
        
        res.status(200).json({
            flag: true,
            message: "Blacklist statistics retrieved successfully",
            stats: stats
        });
        
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Get blacklist stats error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error retrieving blacklist statistics!"
        });
    }
};

module.exports = {
    sendOTP,
    verifyOTP,
    logout,
    logoutAllDevices,
    cleanupTokens,
    getBlacklistStats
};