const activityService = require('../services/activity.service');

// Get all activities controller
const getAllActivities = async (req, res) => {
    return await activityService.getAllActivities(req, res);
};

// Get activity by ID controller
const getActivityById = async (req, res) => {
    return await activityService.getActivityById(req, res);
};

// Get activity by code controller
const getActivityByCode = async (req, res) => {
    return await activityService.getActivityByCode(req, res);
};

// Get activities by state controller
const getActivitiesByState = async (req, res) => {
    return await activityService.getActivitiesByState(req, res);
};

module.exports = {
    getAllActivities,
    getActivityById,
    getActivityByCode,
    getActivitiesByState
};
