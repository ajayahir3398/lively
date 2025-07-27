const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const Customer = db.customer;
const moment = require('moment');

// Generate 4-digit OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Generate JWT token
const generateToken = (customer) => {
    return jwt.sign({
        id: customer.id,
        customer_name: customer.customer_name,
        email: customer.email,
        login_domain: customer.login_domain
    }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '24h'
    });
};

// Send OTP for login
const sendOTP = async (req, res) => {
    try {
        const { phone_number } = req.body;

        // Generate OTP
        const otp = generateOTP();

        let userExists = false;
        // Find customer by phone number
        const customer = await Customer.findOne({
            where: { login_domain: phone_number }
        });

        if (customer) {
            userExists = true;
            // Existing customer - check if account is disabled/blocked
            if (customer.login_disabled) {
                return res.status(403).json({
                    message: "Account is disabled!"
                });
            }

            if (customer.state === 'blocked') {
                return res.status(403).json({
                    message: "Account is blocked!"
                });
            }

            // Update existing customer with OTP
            await customer.update({
                temp_pwd: otp,
                temp_pwd_issued: new Date(),
                temp_pwd_expiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
                write_date: new Date()
            });
        } else {
            // New customer - create fresh user record
            await Customer.create({
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
        }
        console.log(new Date());
        console.log(new Date(Date.now() + 10 * 60 * 1000));

        // For now, return OTP in response (in production, this should be sent via SMS)
        res.status(200).json({
            message: "OTP sent successfully!",
            otp: otp, // Remove this in production
            expires_in: "10 minutes",
            user_exists: userExists
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            message: "Error sending OTP!"
        });
    }
};

// Verify OTP and login
const verifyOTP = async (req, res) => {
    try {
        const { phone_number, otp, customer_name, email } = req.body;

        // Find customer by phone number
        const customer = await Customer.findOne({
            where: { login_domain: phone_number }
        });

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found!"
            });
        }

        // Check if account is disabled
        if (customer.login_disabled) {
            return res.status(403).json({
                message: "Account is disabled!"
            });
        }

        // Check if account is blocked
        if (customer.state === 'blocked') {
            return res.status(403).json({
                message: "Account is blocked!"
            });
        }

        // Verify OTP
        if (customer.temp_pwd !== otp) {
            // Increment failed login count
            await customer.update({
                failed_login_count: (customer.failed_login_count || 0) + 1,
                failed_login_total: (customer.failed_login_total || 0) + 1,
                write_date: new Date()
            });

            return res.status(400).json({
                message: "Invalid OTP!"
            });
        }

        // Check if OTP is expired
        const expiry = moment(customer.temp_pwd_expiry + 'Z').toDate();
        console.log(new Date());
        console.log(expiry);
        if (new Date() > expiry) {

            return res.status(400).json({
                message: "OTP has expired!"
            });
        }

        // If first login, require customer_name and email
        if ((customer.login_count || 0) === 0) {
            if (!customer_name || !email) {
                return res.status(400).json({
                    message: "customer_name and email are required for first login."
                });
            }
        }

        // Clear OTP after successful verification
        const updateData = {
            temp_pwd: null,
            temp_pwd_issued: null,
            temp_pwd_expiry: null,
            login_count: (customer.login_count || 0) + 1,
            last_login: new Date(),
            write_date: new Date(),
            invalidated_tokens: '[]' // Clear invalidated tokens on successful login
        };
        if ((customer.login_count || 0) === 0) {
            updateData.customer_name = customer_name;
            updateData.email = email;
        }
        await customer.update(updateData);

        // Generate JWT token
        const token = generateToken(customer);

        res.status(200).json({
            message: "Login successful!",
            token: token,
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            message: "Error verifying OTP!"
        });
    }
};

// Get customer profile (protected route)
const getProfile = async (req, res) => {
    try {
        // Use user info from JWT token
        const customer = await Customer.findByPk(req.user.id, {
            attributes: { exclude: ['login_pwd', 'temp_pwd'] }
        });

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found!"
            });
        }

        res.status(200).json(customer);

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            message: "Error retrieving profile!"
        });
    }
};

// Logout user (invalidate current token)
const logoutUser = async (req, res) => {
    try {
        // Get the token from the request header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(400).json({
                message: 'No token provided'
            });
        }

        // Find customer by ID from JWT token
        const customer = await Customer.findByPk(req.user.id);
        if (!customer) {
            return res.status(404).json({
                message: 'Customer not found'
            });
        }

        // Parse existing invalidated tokens
        let invalidatedTokens = [];
        try {
            invalidatedTokens = JSON.parse(customer.invalidated_tokens || '[]');
        } catch (error) {
            invalidatedTokens = [];
        }

        // Add current token to invalidated tokens list
        if (!invalidatedTokens.includes(token)) {
            invalidatedTokens.push(token);
        }

        // Update customer with new invalidated tokens list
        await customer.update({
            invalidated_tokens: JSON.stringify(invalidatedTokens),
            write_date: new Date()
        });

        res.status(200).json({
            message: 'Logout successful. Token has been invalidated.',
            logoutTime: new Date().toISOString()
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            message: 'Logout failed: ' + error.message
        });
    }
};

// Logout user from all devices
const logoutAllDevices = async (req, res) => {
    try {
        // Find customer by ID from JWT token
        const customer = await Customer.findByPk(req.user.id);
        if (!customer) {
            return res.status(404).json({
                message: 'Customer not found'
            });
        }

        // Clear all invalidated tokens (this will force all existing tokens to be invalid)
        await customer.update({
            invalidated_tokens: '[]',
            write_date: new Date()
        });

        res.status(200).json({
            message: 'Logged out from all devices successfully.',
            logoutTime: new Date().toISOString()
        });
    } catch (error) {
        console.error('Logout all devices error:', error);
        res.status(500).json({
            message: 'Logout failed: ' + error.message
        });
    }
};

// Utility function to clean up expired tokens from invalidatedTokens array
const cleanupExpiredTokens = async (customerId) => {
    try {
        const customer = await Customer.findByPk(customerId);
        if (!customer || !customer.invalidated_tokens) {
            return;
        }

        let invalidatedTokens = [];
        try {
            invalidatedTokens = JSON.parse(customer.invalidated_tokens);
        } catch (error) {
            return;
        }

        if (invalidatedTokens.length === 0) {
            return;
        }

        const validTokens = [];
        for (const token of invalidatedTokens) {
            try {
                // Try to verify the token to see if it's expired
                jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                // If verification passes, token is still valid (not expired)
                validTokens.push(token);
            } catch (error) {
                // Token is expired or invalid, skip it
                continue;
            }
        }

        // Update customer with only valid tokens
        await customer.update({
            invalidated_tokens: JSON.stringify(validTokens),
            write_date: new Date()
        });
    } catch (error) {
        console.error('Error cleaning up expired tokens:', error);
    }
};

// Manual cleanup of expired tokens (admin function)
const manualCleanupTokens = async (req, res) => {
    try {
        const customers = await Customer.findAll();
        let totalCleaned = 0;
        let usersProcessed = 0;

        for (const customer of customers) {
            try {
                const beforeCount = JSON.parse(customer.invalidated_tokens || '[]').length;
                await cleanupExpiredTokens(customer.id);
                const afterCount = JSON.parse(customer.invalidated_tokens || '[]').length;
                totalCleaned += (beforeCount - afterCount);
                usersProcessed++;
            } catch (error) {
                console.error(`Error processing customer ${customer.id}:`, error);
            }
        }

        res.json({
            message: 'Token cleanup completed successfully',
            totalCleaned,
            usersProcessed
        });
    } catch (error) {
        console.error('Manual cleanup error:', error);
        res.status(500).json({
            message: 'Token cleanup failed: ' + error.message
        });
    }
};

module.exports = {
    sendOTP,
    verifyOTP,
    getProfile,
    logoutUser,
    logoutAllDevices,
    cleanupExpiredTokens,
    manualCleanupTokens
}; 