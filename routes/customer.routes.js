const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { 
  validateAddCustomerBasicInfo, 
  validateRateLimit,
  handleValidationErrors 
} = require('../middleware/validation.middleware');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateCustomerAccount } = require('../middleware/customer.middleware');

/**
 * @swagger
 * /customer/add-basic-info:
 *   post:
 *     summary: Add customer basic info
 *     description: Adds or updates customer basic information including name and email address
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCustomerBasicInfoRequest'
 *     responses:
 *       200:
 *         description: Customer basic info updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddCustomerBasicInfoResponse'
 *       400:
 *         description: Bad request - validation error or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Account disabled or blocked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Customer login not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded
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
router.post('/add-basic-info', 
  verifyToken,
  validateCustomerAccount,
  validateRateLimit,
  validateAddCustomerBasicInfo, 
  handleValidationErrors,
  customerController.addCustomerBasicInfo
);

/**
 * @swagger
 * /customer/profile:
 *   get:
 *     summary: Get customer profile
 *     description: Retrieves the authenticated customer's profile information
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetCustomerProfileResponse'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Account disabled or blocked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded
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
router.get('/profile', 
  verifyToken,
  validateCustomerAccount,
  validateRateLimit,
  customerController.getCustomerProfile
);

module.exports = router; 