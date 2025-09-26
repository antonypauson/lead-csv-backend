/**
 * @file scoring.controller.js
 * @description Controller for handling lead scoring requests.
 */

const scoringService = require('../services/scoring.service');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHandler');
const { validate } = require('../utils/validation');

/**
 * Schema for validating the request body for scoring leads.
 */
const scoreLeadsSchema = {
  type: 'object',
  properties: {
    offerId: { type: 'string', format: 'uuid' },
    leadIds: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      minItems: 1,
    },
  },
  required: ['offerId', 'leadIds'],
  additionalProperties: false,
};

/**
 * Handles the POST /score request to process leads for scoring.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const scoreLeads = async (req, res) => {
  try {
    validate(scoreLeadsSchema, req.body);
    const { offerId, leadIds } = req.body;
    const results = await scoringService.processLeadsForScoring(offerId, leadIds);

    sendSuccessResponse(res, 200, { results }, 'Leads scored successfully');
  } catch (error) {
    sendErrorResponse(res, error.statusCode || 400, error.message);
  }
};

/**
 * Handles the GET /results request to retrieve all stored scoring results.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getResults = (req, res) => {
  try {
    const results = scoringService.getScoringResults();
    
    // Calculate summary
    const totalLeads = results.length;
    const highIntent = results.filter(r => r.intent === 'High').length;
    const mediumIntent = results.filter(r => r.intent === 'Medium').length;
    const lowIntent = results.filter(r => r.intent === 'Low').length;
    const averageScore = totalLeads > 0 ? results.reduce((sum, r) => sum + r.score, 0) / totalLeads : 0;

    const summary = {
      total_leads: totalLeads,
      high_intent: highIntent,
      medium_intent: mediumIntent,
      low_intent: lowIntent,
      average_score: parseFloat(averageScore.toFixed(2)),
    };

    sendSuccessResponse(res, 200, { results, summary }, 'Scoring results retrieved successfully');
  } catch (error) {
    sendErrorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  scoreLeads,
  getResults,
};
