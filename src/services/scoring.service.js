/**
 * @file scoring.service.js
 * @description Service for combining rule-based and AI scores for lead qualification.
 */

const offerService = require('./offer.service');
const leadsService = require('./leads.service');
const ruleScoringService = require('./ruleScoring.service');
const aiScoringService = require('./aiScoring.service');
const { v4: uuidv4 } = require('uuid');

// In-memory storage for scoring results
const scoringResults = {};

/**
 * Calculates the final intent label based on the total score.
 * @param {number} totalScore - The combined rule and AI score.
 * @returns {string} The intent label (High, Medium, Low).
 */
const calculateFinalIntent = (totalScore) => {
  if (totalScore >= 70) return 'High';
  if (totalScore >= 40) return 'Medium';
  return 'Low';
};

/**
 * Processes a batch of leads for scoring based on a specific offer.
 * @param {string} offerId - The ID of the offer.
 * @param {Array<string>} leadIds - An array of lead IDs to be scored.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of detailed scoring results.
 */
const processLeadsForScoring = async (offerId, leadIds) => {
  const offer = offerService.getOfferById(offerId);
  if (!offer) {
    throw new Error(`Offer with ID ${offerId} not found.`);
  }

  const leads = leadsService.getLeadsByIds(leadIds);
  if (leads.length !== leadIds.length) {
    const foundLeadIds = new Set(leads.map(l => l.id));
    const missingLeadIds = leadIds.filter(id => !foundLeadIds.has(id));
    throw new Error(`Some leads not found: ${missingLeadIds.join(', ')}`);
  }

  const results = [];
  for (const lead of leads) {
    const ruleScore = ruleScoringService.scoreLead(lead, offer);
    const aiScore = await aiScoringService.getAiScoreAndReasoning(lead, offer);
    
    const totalScore = ruleScore + aiScore.score;
    const intent = calculateFinalIntent(totalScore);

    const result = {
      id: uuidv4(),
      leadId: lead.id, // Store original lead ID for reference
      name: lead.name,
      role: lead.role,
      company: lead.company,
      industry: lead.industry,
      location: lead.location,
      intent: intent,
      score: totalScore,
      rule_score: ruleScore,
      ai_score: aiScore.score,
      reasoning: aiScore.reasoning,
      processed_at: new Date().toISOString(),
    };
    results.push(result);
    scoringResults[result.id] = result; // Store individual result
  }

  return results;
};

/**
 * Retrieves all stored scoring results.
 * @returns {Array<Object>} An array of all detailed scoring results.
 */
const getScoringResults = () => {
  return Object.values(scoringResults);
};

module.exports = {
  processLeadsForScoring,
  getScoringResults,
  calculateFinalIntent, // Export for testing purposes
};
