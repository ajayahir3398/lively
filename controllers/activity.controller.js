const activityService = require('../services/activity.service');

// Get all activities controller
const getAllActivities = async (req, res) => {
    return await activityService.getAllActivities(req, res);
};

// Get activity by ID controller
const getActivityById = async (req, res) => {
    return await activityService.getActivityById(req, res);
};

// Get courses by activity ID controller
const getCoursesByActivityId = async (req, res) => {
    return await activityService.getCoursesByActivityId(req, res);
};

// Get quick sessions by activity ID controller
const getQuickSessionsByActivityId = async (req, res) => {
    return await activityService.getQuickSessionsByActivityId(req, res);
};

module.exports = {
    getAllActivities,
    getActivityById,
    getCoursesByActivityId,
    getQuickSessionsByActivityId
};
