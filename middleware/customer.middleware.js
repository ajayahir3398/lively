const db = require('../models');
const Customer_Login = db.customer_login;

// Validate customer login and account status (for authenticated users)
const validateCustomerAccount = async (req, res, next) => {
    try {
        const phone_number = req.user.login_domain; // Get phone number from authenticated user

        // Find customer_login by phone number
        const customer_login = await Customer_Login.findOne({
            where: { login_domain: phone_number }
        });

        if (!customer_login) {
            return res.status(404).json({
                flag: false,
                message: "Customer login not found."
            });
        }

        // Check if account is disabled
        if (customer_login.login_disabled) {
            return res.status(403).json({
                flag: false,
                message: "Account is disabled!"
            });
        }

        // Check if account is blocked
        if (customer_login.state === 'blocked') {
            return res.status(403).json({
                flag: false,
                message: "Account is blocked!"
            });
        }

        // Add customer_login to request object for use in subsequent middleware/controllers
        req.customer_login = customer_login;
        next();
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Customer validation error:', error);
        }
        return res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error validating customer account!"
        });
    }
};

// Validate customer login and account status (for non-authenticated users - like during login)
const validateCustomerAccountByPhone = async (req, res, next) => {
    try {
        const { phone_number } = req.body;

        if (!phone_number) {
            return res.status(400).json({
                flag: false,
                message: "Phone number is required."
            });
        }

        // Find customer_login by phone number
        const customer_login = await Customer_Login.findOne({
            where: { login_domain: phone_number }
        });

        if (!customer_login) {
            return res.status(404).json({
                flag: false,
                message: "Customer_Login not found!"
            });
        }

        // Check if account is disabled
        if (customer_login.login_disabled) {
            return res.status(403).json({
                flag: false,
                message: "Account is disabled!"
            });
        }

        // Check if account is blocked
        if (customer_login.state === 'blocked') {
            return res.status(403).json({
                flag: false,
                message: "Account is blocked!"
            });
        }

        // Add customer_login to request object for use in subsequent middleware/controllers
        req.customer_login = customer_login;
        next();
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Customer validation error:', error);
        }
        return res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error validating customer account!"
        });
    }
};

module.exports = {
    validateCustomerAccount,
    validateCustomerAccountByPhone
}; 