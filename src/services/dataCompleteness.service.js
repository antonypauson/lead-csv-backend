/**
 * @fileoverview Service for checking the completeness of lead data.
 * @module services/dataCompletenessService
 */

/**
 * Score for data completeness.
 * @type {number}
 */
const COMPLETENESS_SCORE = 10;

/**
 * Defines the required fields for a lead to be considered complete.
 * @type {string[]}
 */
const REQUIRED_LEAD_FIELDS = ['name', 'role', 'company', 'industry', 'location', 'linkedin_bio'];

/**
 * Checks for data completeness of a lead and returns a score and reasoning.
 * @param {Object} lead - The lead object containing prospect information.
 * @returns {{score: number, reasoning: string, missingFields: string[]}} The completeness result, including score, reasoning, and an array of any missing fields.
 */
function checkCompleteness(lead) {
  const missingFields = [];
  for (const field of REQUIRED_LEAD_FIELDS) {
    if (!lead[field] || (typeof lead[field] === 'string' && lead[field].trim() === '')) {
      missingFields.push(field);
    }
  }

  if (missingFields.length === 0) {
    return {
      score: COMPLETENESS_SCORE,
      reasoning: 'Lead data is complete.',
      missingFields: []
    };
  } else {
    return {
      score: 0,
      reasoning: `Lead data is incomplete. Missing fields: ${missingFields.join(', ')}.`,
      missingFields: missingFields
    };
  }
}

module.exports = {
  checkCompleteness,
  COMPLETENESS_SCORE,
  REQUIRED_LEAD_FIELDS
};
