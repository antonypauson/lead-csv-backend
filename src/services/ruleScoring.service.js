/**
 * @fileoverview Service for calculating a comprehensive rule-based score for leads.
 * @module services/ruleScoringService
 */

const { classifyRole } = require('./roleClassification.service');
const { matchIndustry } = require('./industryMatching.service');
const { checkCompleteness } = require('./dataCompleteness.service');

/**
 * Maximum possible score for rule-based scoring.
 * @type {number}
 */
const MAX_RULE_SCORE = 50;

/**
 * Calculates the total rule-based score for a single lead based on various criteria.
 * @param {Object} lead - The lead object containing prospect information.
 * @param {Object} offer - The offer object containing value propositions and ideal use cases.
 * @returns {{totalScore: number, breakdown: Object, logs: string[]}} The total score, a detailed breakdown, and logs of scoring decisions.
 */
function calculateRuleScore(lead, offer) {
  let totalScore = 0;
  const breakdown = {};
  const logs = [];

  // Input Validation for lead and offer
  if (!lead || typeof lead !== 'object') {
    logs.push('Error: Invalid lead object provided.');
    return { totalScore: 0, breakdown: {}, logs };
  }
  if (!offer || typeof offer !== 'object' || !offer.ideal_use_cases) {
    logs.push('Error: Invalid offer object or missing ideal_use_cases provided.');
    return { totalScore: 0, breakdown: {}, logs };
  }

  // 1. Role Classification
  try {
    const roleResult = classifyRole(lead.role || ''); // Pass empty string if role is missing
    totalScore += roleResult.score;
    breakdown.role = { ...roleResult };
    logs.push(`Role Scoring: ${roleResult.reasoning} (Score: ${roleResult.score})`);
  } catch (error) {
    logs.push(`Error during Role Scoring: ${error.message}. Assigning 0 score.`);
    breakdown.role = { category: 'error', score: 0, reasoning: `Error: ${error.message}`, matchedKeywords: [] };
  }

  // 2. Industry Matching
  try {
    const industryResult = matchIndustry(lead.industry || '', offer.ideal_use_cases); // Pass empty string if industry is missing
    totalScore += industryResult.score;
    breakdown.industry = { ...industryResult };
    logs.push(`Industry Scoring: ${industryResult.reasoning} (Score: ${industryResult.score})`);
  } catch (error) {
    logs.push(`Error during Industry Matching: ${error.message}. Assigning 0 score.`);
    breakdown.industry = { matchType: 'error', score: 0, reasoning: `Error: ${error.message}`, matchedKeywords: [] };
  }

  // 3. Data Completeness
  try {
    const completenessResult = checkCompleteness(lead);
    totalScore += completenessResult.score;
    breakdown.completeness = { ...completenessResult };
    logs.push(`Completeness Scoring: ${completenessResult.reasoning} (Score: ${completenessResult.score})`);
  } catch (error) {
    logs.push(`Error during Data Completeness Check: ${error.message}. Assigning 0 score.`);
    breakdown.completeness = { score: 0, reasoning: `Error: ${error.message}`, missingFields: [] };
  }

  // Max Rule Score
  if (totalScore > MAX_RULE_SCORE) {
    totalScore = MAX_RULE_SCORE;
    logs.push(`Total rule-based score capped at MAX_RULE_SCORE (${MAX_RULE_SCORE}).`);
  }

  return {
    totalScore,
    breakdown,
    logs
  };
}

module.exports = {
  calculateRuleScore,
  MAX_RULE_SCORE,
};
