const express = require('express');
const leadsController = require('../controllers/leads.controller');
const uploadCsvMiddleware = require('../middleware/uploadMiddleware');

const router = express.Router();

/**
 * @route POST /api/leads/upload
 * @description Uploads a CSV file containing leads for qualification.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {void} Sends a success or error response.
 */
router.post('/upload', uploadCsvMiddleware, leadsController.uploadLeads);

/**
 * @route GET /api/leads
 * @description Retrieves all processed leads data.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void} Sends a success or error response with leads data.
 */
router.get('/', leadsController.getLeads);

module.exports = router;
