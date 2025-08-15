const attachmentService = require('../services/attachment.service');

// Get attachments by resource controller
const getAttachmentsByResource = async (req, res) => {
    return await attachmentService.getAttachmentsByResource(req, res);
};

// Get attachment by ID controller
const getAttachmentById = async (req, res) => {
    return await attachmentService.getAttachmentById(req, res);
};

module.exports = {
    getAttachmentsByResource,
    getAttachmentById
};
