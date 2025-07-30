const customerService = require('../services/customer.service');

// Add customer basic info controller
const addCustomerBasicInfo = async (req, res) => {
    return await customerService.addCustomerBasicInfo(req, res);
};

// Get customer profile controller
const getCustomerProfile = async (req, res) => {
    return await customerService.getCustomerProfile(req, res);
};

module.exports = {
    addCustomerBasicInfo,
    getCustomerProfile
}; 