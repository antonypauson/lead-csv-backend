/**
 * @file scoring.routes.js
 * @description Defines the API routes for lead scoring.
 */

const express = require('express');
const router = express.Router();
const scoringController = require('../controllers/scoring.controller');

/**
 * @route POST /api/score
 * @description Processes a batch of leads for scoring based on a specific offer.
 * @access Public
 */
router.post('/score', scoringController.scoreLeads);

/**
 * @route GET /api/results
 * @description Retrieves all stored lead scoring results with a summary.
 * @access Public
 */
router.get('/results', scoringController.getResults);

module.exports = router;
