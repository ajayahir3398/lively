const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /attachment/resource/{res_model}/{res_id}:
 *   get:
 *     summary: Get attachments by resource
 *     description: Retrieves all attachments for a specific resource identified by res_model and res_id
 *     tags: [Attachment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: res_model
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource model name (e.g., 'res.partner', 'res.company')
 *         example: "res.partner"
 *       - in: path
 *         name: res_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Resource ID
 *         example: 123
 *     responses:
 *       200:
 *         description: Attachments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetAttachmentsByResourceResponse'
 *       400:
 *         description: Bad request - missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flag:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Both res_id and res_model are required parameters."
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/resource/:res_model/:res_id', 
    verifyToken,
    attachmentController.getAttachmentsByResource
);

/**
 * @swagger
 * /attachment/{id}:
 *   get:
 *     summary: Get attachment by ID
 *     description: Retrieves a specific attachment by its ID
 *     tags: [Attachment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attachment ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Attachment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetAttachmentByIdResponse'
 *       400:
 *         description: Bad request - missing attachment ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flag:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Attachment ID is required."
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Attachment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flag:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Attachment not found."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', 
    verifyToken,
    attachmentController.getAttachmentById
);

module.exports = router;
