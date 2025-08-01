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
                phone_number: customer_login.login_domain
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
            email2: customer?.email2 || null,
            login_name: customer?.login_name || null,
            mobile_phone1: customer?.mobile_phone1 || null,
            mobile_phone2: customer?.mobile_phone2 || null,
            home_phone: customer?.home_phone || null,
            work_phone: customer?.work_phone || null,
            work_phone_ext: customer?.work_phone_ext || null,
            gender: customer?.gender || null,
            marital_status: customer?.marital_status || null,
            date_of_birth: customer?.date_of_birth || null,
            national_id_no: customer?.national_id_no || null,
            other_id_no: customer?.other_id_no || null,
            national_id_expiry: customer?.national_id_expiry || null,
            other_id_expiry: customer?.other_id_expiry || null,
            comments: customer?.comments || null,
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

// Update customer profile
const updateCustomerProfile = async (req, res) => {
    try {
        const customer_login = req.customer_login; // Get from middleware
        const updateData = req.body;

        // Check if email is being updated and if it's already in use by another customer
        if (updateData.email) {
            const existingEmailCustomer = await Customer_Login.findOne({
                where: { 
                    email: updateData.email,
                    id: { [db.Sequelize.Op.ne]: customer_login.id }
                }
            });

            if (existingEmailCustomer) {
                return res.status(400).json({
                    flag: false,
                    message: "Email address is already in use by another customer."
                });
            }
        }

        // Prepare customer_login update data
        const customerLoginUpdateData = {};
        if (updateData.name) customerLoginUpdateData.customer_name = updateData.name;
        if (updateData.email) customerLoginUpdateData.email = updateData.email;
        customerLoginUpdateData.write_date = new Date();

        // Update customer_login if there are changes
        if (Object.keys(customerLoginUpdateData).length > 1) { // More than just write_date
            await customer_login.update(customerLoginUpdateData);
        }

        // Find the corresponding customer record
        const customer = await Customer.findOne({
            where: { login_id: customer_login.id }
        });

        if (customer) {
            // Prepare customer update data
            const customerUpdateData = {
                write_date: new Date()
            };

            // Map request fields to customer model fields
            if (updateData.name) customerUpdateData.name = updateData.name;
            if (updateData.email) customerUpdateData.email1 = updateData.email;
            if (updateData.email2) customerUpdateData.email2 = updateData.email2;
            if (updateData.login_name) customerUpdateData.login_name = updateData.login_name;
            if (updateData.mobile_phone1) customerUpdateData.mobile_phone1 = updateData.mobile_phone1;
            if (updateData.mobile_phone2) customerUpdateData.mobile_phone2 = updateData.mobile_phone2;
            if (updateData.home_phone) customerUpdateData.home_phone = updateData.home_phone;
            if (updateData.work_phone) customerUpdateData.work_phone = updateData.work_phone;
            if (updateData.work_phone_ext) customerUpdateData.work_phone_ext = updateData.work_phone_ext;
            if (updateData.gender) customerUpdateData.gender = updateData.gender;
            if (updateData.marital_status) customerUpdateData.marital_status = updateData.marital_status;
            if (updateData.date_of_birth) customerUpdateData.date_of_birth = updateData.date_of_birth;
            if (updateData.national_id_no) customerUpdateData.national_id_no = updateData.national_id_no;
            if (updateData.other_id_no) customerUpdateData.other_id_no = updateData.other_id_no;
            if (updateData.national_id_expiry) customerUpdateData.national_id_expiry = updateData.national_id_expiry;
            if (updateData.other_id_expiry) customerUpdateData.other_id_expiry = updateData.other_id_expiry;
            if (updateData.comments) customerUpdateData.comments = updateData.comments;

            // Update customer record
            await customer.update(customerUpdateData);
        }

        // Get updated profile data
        const updatedCustomer = await Customer.findOne({
            where: { login_id: customer_login.id }
        });

        const updatedProfileData = {
            id: customer_login.id,
            phone_number: customer_login.login_domain,
            name: updatedCustomer?.name || customer_login.customer_name || null,
            email: customer_login.email || updatedCustomer?.email1 || null,
            email2: updatedCustomer?.email2 || null,
            login_name: updatedCustomer?.login_name || null,
            mobile_phone1: updatedCustomer?.mobile_phone1 || null,
            mobile_phone2: updatedCustomer?.mobile_phone2 || null,
            home_phone: updatedCustomer?.home_phone || null,
            work_phone: updatedCustomer?.work_phone || null,
            work_phone_ext: updatedCustomer?.work_phone_ext || null,
            gender: updatedCustomer?.gender || null,
            marital_status: updatedCustomer?.marital_status || null,
            date_of_birth: updatedCustomer?.date_of_birth || null,
            national_id_no: updatedCustomer?.national_id_no || null,
            other_id_no: updatedCustomer?.other_id_no || null,
            national_id_expiry: updatedCustomer?.national_id_expiry || null,
            other_id_expiry: updatedCustomer?.other_id_expiry || null,
            comments: updatedCustomer?.comments || null,
            state: customer_login.state,
            login_count: customer_login.login_count || 0,
            last_login: customer_login.last_login,
            date_signed_up: updatedCustomer?.date_signed_up,
            last_activity_date: updatedCustomer?.last_activity_date,
            has_basic_info: !!(updatedCustomer?.name && updatedCustomer?.email1)
        };

        res.status(200).json({
            flag: true,
            message: "Customer profile updated successfully!",
            data: updatedProfileData
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Update customer profile error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error updating customer profile!"
        });
    }
};

module.exports = {
    addCustomerBasicInfo,
    getCustomerProfile,
    updateCustomerProfile
}; 