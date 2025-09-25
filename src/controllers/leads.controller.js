const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHandler');
const leadsService = require('../services/leads.service'); 

/**
 * @function uploadLeads
 * @description Handles the POST /leads/upload endpoint. Gives file processing
* to leadsService and sends appropriate response.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void} Sends a success or error response.
 */
const uploadLeads = async (req, res) => { 
  try {
    // Assuming req.file is guaranteed to be present by uploadMiddleware
    const filePath = req.file.path;

    const { batchId, leadsCount } = await leadsService.processUploadedLeads(filePath);

    sendSuccessResponse(res, 200, {
      batch_id: batchId,
      leads_count: leadsCount,
      message: 'Leads uploaded and processed successfully',
    });
  } catch (error) {
    console.log('Error processing leads upload:', error); 
    sendErrorResponse(res, 500, 'Internal Server Error', { details: error.message });
  }
};

/**
 * @function getLeads
 * @description Handles the GET /leads endpoint. Retrieves all processed leads data.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void} Sends a success or error response with leads data.
 */
const getLeads = (req, res) => {
  try {
    const allLeads = leadsService.getLeadsData();
    sendSuccessResponse(res, 200, allLeads, 'Successfully retrieved leads data');
  } catch (error) {
    console.error('Error retrieving leads data:', error);
    sendErrorResponse(res, 500, 'Internal Server Error', { details: error.message });
  }
};

module.exports = {
  uploadLeads,
  getLeads,
};
