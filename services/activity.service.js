const db = require('../models');
const Activity = db.activity;

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
            ]
        });

        // Calculate pagination info
        const totalPages = Math.ceil(result.count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            flag: true,
            message: "Activities retrieved successfully!",
            data: result.rows,
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
            ]
        });

        if (!activity) {
            return res.status(404).json({
                flag: false,
                message: "Activity not found!"
            });
        }

        res.status(200).json({
            flag: true,
            message: "Activity retrieved successfully!",
            data: activity
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
            ]
        });

        if (!activity) {
            return res.status(404).json({
                flag: false,
                message: "Activity not found with the specified code!"
            });
        }

        res.status(200).json({
            flag: true,
            message: "Activity retrieved successfully!",
            data: activity
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
            ]
        });

        if (result.count === 0) {
            return res.status(404).json({
                flag: false,
                message: `No activities found with state: ${state}`
            });
        }

        // Calculate pagination info
        const totalPages = Math.ceil(result.count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            flag: true,
            message: `Activities with state '${state}' retrieved successfully!`,
            data: result.rows,
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

module.exports = {
    getAllActivities,
    getActivityById,
    getActivityByCode,
    getActivitiesByState
};
