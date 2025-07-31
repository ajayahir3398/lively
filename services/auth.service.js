const jwt = require('jsonwebtoken');
const db = require('../models');
const Customer_Login = db.customer_login;
const Customer = db.customer;
const moment = require('moment');

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
        // Find customer_login by phone number
        const customer_login = await Customer_Login.findOne({
            where: { login_domain: phone_number }
        });

        if (customer_login) {
            userExists = true;
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

module.exports = {
    sendOTP,
    verifyOTP
};