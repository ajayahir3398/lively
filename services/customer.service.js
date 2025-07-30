const db = require('../models');
const Customer_Login = db.customer_login;
const Customer = db.customer;

// Add customer basic info
const addCustomerBasicInfo = async (req, res) => {
    try {
        const { name, email } = req.body;
        const customer_login = req.customer_login; // Get from middleware

        // Check if email is already in use by another customer
        const existingEmailCustomer = await Customer_Login.findOne({
            where: { 
                email: email,
                id: { [db.Sequelize.Op.ne]: customer_login.id }
            }
        });

        if (existingEmailCustomer) {
            return res.status(400).json({
                flag: false,
                message: "Email address is already in use by another customer."
            });
        }

        // Update customer_login with name and email
        await customer_login.update({
            customer_name: name,
            email: email,
            write_date: new Date()
        });

        // Find and update the corresponding customer record
        const customer = await Customer.findOne({
            where: { login_id: customer_login.id }
        });

        if (customer) {
            await customer.update({
                name: name,
                email1: email,
                write_date: new Date()
            });
        }

        res.status(200).json({
            flag: true,
            message: "Customer basic info updated successfully!",
            data: {
                id: customer_login.id,
                name: name,
                email: email,
                phone_number: phone_number
            }
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Add customer basic info error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error updating customer basic info!"
        });
    }
};

// Get customer profile
const getCustomerProfile = async (req, res) => {
    try {
        const customer_login = req.customer_login; // Get from middleware

        // Find the corresponding customer record
        const customer = await Customer.findOne({
            where: { login_id: customer_login.id }
        });

        // Prepare profile data
        const profileData = {
            id: customer_login.id,
            phone_number: customer_login.login_domain,
            name: customer?.name || customer_login.customer_name || null,
            email: customer_login.email || customer?.email1 || null,
            state: customer_login.state,
            login_count: customer_login.login_count || 0,
            last_login: customer_login.last_login,
            date_signed_up: customer?.date_signed_up,
            last_activity_date: customer?.last_activity_date,
            has_basic_info: !!(customer?.name && customer?.email1)
        };

        res.status(200).json({
            flag: true,
            message: "Customer profile retrieved successfully!",
            data: profileData
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Get customer profile error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error retrieving customer profile!"
        });
    }
};

module.exports = {
    addCustomerBasicInfo,
    getCustomerProfile
}; 