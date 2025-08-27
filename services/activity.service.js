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
                    attributes: ['id', 'name', 'url', 'mimetype', 'file_size', 'public'],
                    where: {
                        res_model: 'lp.activity'
                    },
                    required: false
                }
            ]
        });

        // Add imageUrl to each activity
        const activities = result.rows.map(activity => {
            const activityData = activity.toJSON();
            if (activityData.attachments && activityData.attachments.length > 0) {
                activityData.attachments = activityData.attachments.map(attachment => {
                    return {
                        ...attachment,
                        attachment_url: `${process.env.ODOO_SERVER_URL}/content/${attachment.id}`
                    };
                });
            }
            activityData.attachments = activityData.attachments || [];
            return activityData;
        });

        // Calculate pagination info
        const totalPages = Math.ceil(result.count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            flag: true,
            message: "Activities retrieved successfully!",
            data: activities,
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
                    attributes: ['id', 'name', 'url', 'mimetype', 'file_size', 'public'],
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
        if (activityData.attachments && activityData.attachments.length > 0) {
            activityData.attachments = activityData.attachments.map(attachment => {
                return {
                    ...attachment,
                    attachment_url: `${process.env.ODOO_SERVER_URL}/content/${attachment.id}`
                };
            });
        }
        activityData.attachments = activityData.attachments || [];

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
                    attributes: ['id', 'name', 'url', 'mimetype', 'file_size', 'public'],
                    where: {
                        res_model: 'lp.course'
                    },
                    required: false
                },
                {
                    model: db.document,
                    as: 'documents',
                    attributes: [
                        'id',
                        'name',
                        'file_name',
                        'file_loc',
                        'permission'
                    ],
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

        // Add imageUrl to each course and process documents
        const courses = result.rows.map(course => {
            const courseData = course.toJSON();
            if (courseData.attachments && courseData.attachments.length > 0) {
                courseData.attachments = courseData.attachments.map(attachment => {
                    return {
                        ...attachment,
                        attachment_url: `${process.env.ODOO_SERVER_URL}/content/${attachment.id}`
                    };
                });
            }
            courseData.attachments = courseData.attachments || [];
            
            if(courseData.documents && courseData.documents.length > 0){
                courseData.documents = courseData.documents.map(document => {
                    return {
                        ...document,
                        document_url: `${process.env.ODOO_SERVER_URL}${document.file_loc}`
                    };
                });
            }
            courseData.documents = courseData.documents || [];
            
            return courseData;
        });

        // Calculate pagination info
        const totalPages = Math.ceil(result.count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            flag: true,
            message: "Courses retrieved successfully!",
            data: courses,
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
                    attributes: ['id', 'name', 'url', 'mimetype', 'file_size', 'public'],
                    where: {
                        res_model: 'lp.quick_sess'
                    },
                    required: false
                },
                {
                    model: db.document,
                    as: 'documents',
                    attributes: [
                        'id',
                        'name',
                        'file_name',
                        'file_loc',
                        'permission'
                    ],
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

        // Add imageUrl to each quick session and process documents
        const quickSessions = result.rows.map(quickSession => {
            const quickSessionData = quickSession.toJSON();
            if (quickSessionData.attachments && quickSessionData.attachments.length > 0) {
                quickSessionData.attachments = quickSessionData.attachments.map(attachment => {
                    return {
                        ...attachment,
                        attachment_url: `${process.env.ODOO_SERVER_URL}/content/${attachment.id}`
                    };
                });
            }
            quickSessionData.attachments = quickSessionData.attachments || [];
            
            if(quickSessionData.documents && quickSessionData.documents.length > 0){
                quickSessionData.documents = quickSessionData.documents.map(document => {
                    return {
                        ...document,
                        document_url: `${process.env.ODOO_SERVER_URL}${document.file_loc}`
                    };
                });
            }
            quickSessionData.documents = quickSessionData.documents || [];
            
            return quickSessionData;
        });

        // Calculate pagination info
        const totalPages = Math.ceil(result.count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            flag: true,
            message: "Quick sessions retrieved successfully!",
            data: quickSessions,
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
    getCoursesByActivityId,
    getQuickSessionsByActivityId
};
