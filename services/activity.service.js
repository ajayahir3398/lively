const db = require('../models');
const Activity = db.activity;
const IrAttachment = db.ir_attachment;

// Get all activities with optional filtering and pagination
const getAllActivities = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            state,
            code,
            name,
            sortBy = 'create_date',
            sortOrder = 'DESC'
        } = req.query;

        // Build where clause for filtering
        const whereClause = {};
        if (state) {
            whereClause.state = state;
        }
        if (code) {
            whereClause.code = {
                [db.Sequelize.Op.iLike]: `%${code}%`
            };
        }
        if (name) {
            whereClause.name = {
                [db.Sequelize.Op.iLike]: `%${name}%`
            };
        }

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Valid sort fields
        const validSortFields = ['id', 'name', 'code', 'state', 'create_date', 'write_date'];
        const validSortOrders = ['ASC', 'DESC'];

        const orderBy = validSortFields.includes(sortBy) ? sortBy : 'create_date';
        const orderDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

        // Fetch activities with pagination and filtering
        const result = await Activity.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[orderBy, orderDirection]],
            attributes: [
                'id',
                'name',
                'code',
                'description',
                'state',
                'comments',
                'create_date',
                'write_date'
            ],
            include: [
                {
                    model: IrAttachment,
                    as: 'attachments',
                    attributes: ['id'],
                    where: {
                        res_model: 'lp.activity'
                    },
                    required: false
                }
            ]
        });

        // Add imageUrl to each activity
        const activitiesWithImageUrl = result.rows.map(activity => {
            const activityData = activity.toJSON();
            if (activity.attachments && activity.attachments.length > 0) {
                const attachmentId = activity.attachments[0].id;
                activityData.imageUrl = `${process.env.ODOO_SERVER_URL}content/${attachmentId}`;
            } else {
                activityData.imageUrl = null;
            }
            return activityData;
        });

        // Calculate pagination info
        const totalPages = Math.ceil(result.count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            flag: true,
            message: "Activities retrieved successfully!",
            data: activitiesWithImageUrl,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalRecords: result.count,
                limit: parseInt(limit),
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Get all activities error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error retrieving activities!"
        });
    }
};

// Get single activity by ID
const getActivityById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID parameter
        if (!id || isNaN(id)) {
            return res.status(400).json({
                flag: false,
                message: "Valid activity ID is required!"
            });
        }

        const activity = await Activity.findByPk(id, {
            attributes: [
                'id',
                'name',
                'code',
                'description',
                'state',
                'comments',
                'create_date',
                'write_date'
            ],
            include: [
                {
                    model: IrAttachment,
                    as: 'attachments',
                    attributes: ['id'],
                    where: {
                        res_model: 'lp.activity'
                    },
                    required: false
                }
            ]
        });

        if (!activity) {
            return res.status(404).json({
                flag: false,
                message: "Activity not found!"
            });
        }

        // Add imageUrl to activity
        const activityData = activity.toJSON();
        if (activity.attachments && activity.attachments.length > 0) {
            const attachmentId = activity.attachments[0].id;
            activityData.imageUrl = `${process.env.ODOO_SERVER_URL}content/${attachmentId}`;
        } else {
            activityData.imageUrl = null;
        }

        res.status(200).json({
            flag: true,
            message: "Activity retrieved successfully!",
            data: activityData
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Get activity by ID error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error retrieving activity!"
        });
    }
};

// Get activity by code
const getActivityByCode = async (req, res) => {
    try {
        const { code } = req.params;

        // Validate code parameter
        if (!code) {
            return res.status(400).json({
                flag: false,
                message: "Activity code is required!"
            });
        }

        const activity = await Activity.findOne({
            where: { code: code },
            attributes: [
                'id',
                'name',
                'code',
                'description',
                'state',
                'comments',
                'create_date',
                'write_date'
            ],
            include: [
                {
                    model: IrAttachment,
                    as: 'attachments',
                    attributes: ['id'],
                    where: {
                        res_model: 'lp.activity'
                    },
                    required: false
                }
            ]
        });

        if (!activity) {
            return res.status(404).json({
                flag: false,
                message: "Activity not found with the specified code!"
            });
        }

        // Add imageUrl to activity
        const activityData = activity.toJSON();
        if (activity.attachments && activity.attachments.length > 0) {
            const attachmentId = activity.attachments[0].id;
            activityData.imageUrl = `${process.env.ODOO_SERVER_URL}content/${attachmentId}`;
        } else {
            activityData.imageUrl = null;
        }

        res.status(200).json({
            flag: true,
            message: "Activity retrieved successfully!",
            data: activityData
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Get activity by code error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error retrieving activity!"
        });
    }
};

// Get activities by state
const getActivitiesByState = async (req, res) => {
    try {
        const { state } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Validate state parameter
        if (!state) {
            return res.status(400).json({
                flag: false,
                message: "Activity state is required!"
            });
        }

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        const result = await Activity.findAndCountAll({
            where: { state: state },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['create_date', 'DESC']],
            attributes: [
                'id',
                'name',
                'code',
                'description',
                'state',
                'comments',
                'create_date',
                'write_date'
            ],
            include: [
                {
                    model: IrAttachment,
                    as: 'attachments',
                    attributes: ['id'],
                    where: {
                        res_model: 'lp.activity'
                    },
                    required: false
                }
            ]
        });

        if (result.count === 0) {
            return res.status(404).json({
                flag: false,
                message: `No activities found with state: ${state}`
            });
        }

        // Add imageUrl to each activity
        const activitiesWithImageUrl = result.rows.map(activity => {
            const activityData = activity.toJSON();
            if (activity.attachments && activity.attachments.length > 0) {
                const attachmentId = activity.attachments[0].id;
                activityData.imageUrl = `${process.env.ODOO_SERVER_URL}content/${attachmentId}`;
            } else {
                activityData.imageUrl = null;
            }
            return activityData;
        });

        // Calculate pagination info
        const totalPages = Math.ceil(result.count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            flag: true,
            message: `Activities with state '${state}' retrieved successfully!`,
            data: activitiesWithImageUrl,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalRecords: result.count,
                limit: parseInt(limit),
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Get activities by state error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error retrieving activities by state!"
        });
    }
};

// Get courses by activity ID
const getCoursesByActivityId = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Validate ID parameter
        if (!id || isNaN(id)) {
            return res.status(400).json({
                flag: false,
                message: "Valid activity ID is required!"
            });
        }

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // First check if activity exists
        const activity = await Activity.findByPk(id);
        if (!activity) {
            return res.status(404).json({
                flag: false,
                message: "Activity not found!"
            });
        }

        // Get courses associated with this activity
        const result = await db.course.findAndCountAll({
            where: { activity_id: parseInt(id) },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['create_date', 'DESC']],
            attributes: [
                'id',
                'course_ref_id',
                'activity_id',
                'name',
                'code',
                'description',
                'state',
                'comments',
                'create_date',
                'write_date'
            ],
            include: [
                {
                    model: IrAttachment,
                    as: 'attachments',
                    attributes: ['id'],
                    where: {
                        res_model: 'lp.course'
                    },
                    required: false
                }
            ]
        });

        if (result.count === 0) {
            return res.status(404).json({
                flag: false,
                message: "No courses found for this activity!"
            });
        }

        // Add imageUrl to each course
        const coursesWithImageUrl = result.rows.map(course => {
            const courseData = course.toJSON();
            if (course.attachments && course.attachments.length > 0) {
                const attachmentId = course.attachments[0].id;
                courseData.imageUrl = `${process.env.ODOO_SERVER_URL}content/${attachmentId}`;
            } else {
                courseData.imageUrl = null;
            }
            return courseData;
        });

        // Calculate pagination info
        const totalPages = Math.ceil(result.count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            flag: true,
            message: "Courses retrieved successfully!",
            data: coursesWithImageUrl,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalRecords: result.count,
                limit: parseInt(limit),
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Get courses by activity ID error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error retrieving courses!"
        });
    }
};

// Get quick sessions by activity ID
const getQuickSessionsByActivityId = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Validate ID parameter
        if (!id || isNaN(id)) {
            return res.status(400).json({
                flag: false,
                message: "Valid activity ID is required!"
            });
        }

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // First check if activity exists
        const activity = await Activity.findByPk(id);
        if (!activity) {
            return res.status(404).json({
                flag: false,
                message: "Activity not found!"
            });
        }

        // Get quick sessions associated with this activity
        const result = await db.quickSession.findAndCountAll({
            where: { activity_id: parseInt(id) },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['create_date', 'DESC']],
            attributes: [
                'id',
                'sess_ref_id',
                'activity_id',
                'name',
                'code',
                'description',
                'state',
                'comments',
                'create_date',
                'write_date'
            ],
            include: [
                {
                    model: IrAttachment,
                    as: 'attachments',
                    attributes: ['id'],
                    where: {
                        res_model: 'lp.quick_sess'
                    },
                    required: false
                }
            ]
        });

        if (result.count === 0) {
            return res.status(404).json({
                flag: false,
                message: "No quick sessions found for this activity!"
            });
        }

        // Add imageUrl to each quick session
        const quickSessionsWithImageUrl = result.rows.map(quickSession => {
            const quickSessionData = quickSession.toJSON();
            if (quickSession.attachments && quickSession.attachments.length > 0) {
                const attachmentId = quickSession.attachments[0].id;
                quickSessionData.imageUrl = `${process.env.ODOO_SERVER_URL}content/${attachmentId}`;
            } else {
                quickSessionData.imageUrl = null;
            }
            return quickSessionData;
        });

        // Calculate pagination info
        const totalPages = Math.ceil(result.count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            flag: true,
            message: "Quick sessions retrieved successfully!",
            data: quickSessionsWithImageUrl,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalRecords: result.count,
                limit: parseInt(limit),
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Get quick sessions by activity ID error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error retrieving quick sessions!"
        });
    }
};

module.exports = {
    getAllActivities,
    getActivityById,
    getActivityByCode,
    getActivitiesByState,
    getCoursesByActivityId,
    getQuickSessionsByActivityId
};
