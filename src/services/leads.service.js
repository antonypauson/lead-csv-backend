const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const csvParserService = require('./csvParser.service'); 
const { validateCsvHeaders } = require('../utils/csvValidation'); 

// In-memory storage for leads data
const leadsData = {}; 

/**
 * @function processUploadedLeads
 * @description Processes an uploaded CSV file containing leads.
 * Parses the CSV, validates headers, stores leads in memory, and cleans up the file.
 * @param {string} filePath - The temporary path of the uploaded CSV file.
 * @returns {Promise<object>} An object containing the batchId and leadsCount.
 * @throws {Error} If CSV parsing fails or headers are invalid.
 */
const processUploadedLeads = async (filePath) => {
  try {
    const batchId = uuidv4();

    // Parse CSV
    const parsedLeads = await csvParserService.parseCsv(filePath);

    // Validate CSV headers
    const expectedHeaders = ['name', 'role', 'company', 'industry', 'location', 'linkedin_bio'];
    const headerValidation = validateCsvHeaders(parsedLeads, expectedHeaders);

    if (!headerValidation.isValid) {
      const missing = headerValidation.missingHeaders.join(', ');
      throw new Error(`Invalid CSV headers. Missing headers: ${missing}. Expected: ${expectedHeaders.join(',')}`);
    }

    // Store parsed leads with unique IDs
    leadsData[batchId] = parsedLeads.map(lead => ({
      id: uuidv4(),
      ...lead,
      rule_score: 0, // Initialize scores
      ai_score: 0,
      total_score: 0,
      intent: 'Low',
      reasoning: '',
      processed_at: new Date().toISOString(),
    }));

    return { batchId, leadsCount: leadsData[batchId].length };
  } catch (error) {
    throw error; 
  } finally {
    // Clean up uploaded file after processing
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

/**
 * @function getLeadsData
 * @description Retrieves the in-memory leads data.
 * @returns {object} The leads data object.
 */
const getLeadsData = () => leadsData;

module.exports = {
  processUploadedLeads,
  getLeadsData,
};
