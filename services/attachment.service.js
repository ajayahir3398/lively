const db = require('../models');
const IrAttachment = db.ir_attachment;

// Get attachments by res_id and res_model
const getAttachmentsByResource = async (req, res) => {
    try {
        const { res_id, res_model } = req.params;

        // Validate required parameters
        if (!res_id || !res_model) {
            return res.status(400).json({
                flag: false,
                message: "Both res_id and res_model are required parameters."
            });
        }

        // Find attachments for the specified resource
        const attachments = await IrAttachment.findAll({
            where: {
                res_id: res_id,
                res_model: res_model
            },
            attributes: [
                'id', 'name', 'type', 'url', 'file_size', 'mimetype',
                'description', 'public', 'create_date', 'write_date',
                'checksum', 'store_fname'
            ],
            order: [['create_date', 'DESC']]
        });

        if (!attachments || attachments.length === 0) {
            return res.status(200).json({
                flag: true,
                message: "No attachments found for the specified resource.",
                data: []
            });
        }

        res.status(200).json({
            flag: true,
            message: "Attachments retrieved successfully!",
            data: attachments,
            count: attachments.length
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Get attachments by resource error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error retrieving attachments!"
        });
    }
};

// Get attachment by ID
const getAttachmentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                flag: false,
                message: "Attachment ID is required."
            });
        }

        const attachment = await IrAttachment.findByPk(id, {
            attributes: [
                'id', 'name', 'type', 'url', 'file_size', 'mimetype',
                'description', 'public', 'create_date', 'write_date',
                'checksum', 'store_fname', 'res_id', 'res_model', 'res_field'
            ]
        });

        if (!attachment) {
            return res.status(404).json({
                flag: false,
                message: "Attachment not found."
            });
        }

        res.status(200).json({
            flag: true,
            message: "Attachment retrieved successfully!",
            data: attachment
        });

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Get attachment by ID error:', error);
        }
        res.status(500).json({
            flag: false,
            error: error.message,
            message: "Error retrieving attachment!"
        });
    }
};

module.exports = {
    getAttachmentsByResource,
    getAttachmentById
};
