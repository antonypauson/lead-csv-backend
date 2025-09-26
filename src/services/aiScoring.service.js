/**
 * @fileoverview Service for integrating with the OpenAI API 
 * @module services/aiScoringService
 */

const OpenAI = require('openai');
const { groqApiKey } = require('../config'); 

let groq;

/**
 * Initializes the Groq client.
 * @returns {OpenAI} The initialized Groq client instance (using OpenAI SDK for compatibility).
 */
function initializeGroqClient() {
  if (!groqApiKey) {
    throw new Error('Groq API key is not configured.');
  }
  groq = new OpenAI({
    apiKey: groqApiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
  return groq;
}

/**
 * Creates a contextual prompt for AI intent analysis.
 * @param {Object} offer - The offer details.
 * @param {string} offer.name - The name of the offer.
 * @param {string[]} offer.value_props - Value propositions of the offer.
 * @param {string[]} offer.ideal_use_cases - Ideal use cases for the offer.
 * @param {Object} lead - The lead's profile information.
 * @param {string} lead.name - The lead's name.
 * @param {string} lead.role - The lead's role.
 * @param {string} lead.company - The lead's company.
 * @param {string} lead.industry - The lead's industry.
 * @param {string} lead.location - The lead's location.
 * @param {string} lead.linkedin_bio - The lead's LinkedIn bio.
 * @param {Object} ruleScore - The rule-based score breakdown for additional context.
 * @returns {string} The formatted prompt for the AI.
 */
function createContextualPrompt(offer, lead, ruleScore) {
  return `You are an expert B2B sales analyst. Analyze this prospect's buying intent for our offer.

OFFER DETAILS:
Product: ${offer.name}
Value Propositions: ${offer.value_props.join(', ')}
Ideal Use Cases: ${offer.ideal_use_cases.join(', ')}

PROSPECT PROFILE:
Name: ${lead.name}
Role: ${lead.role}
Company: ${lead.company}
Industry: ${lead.industry}
Location: ${lead.location}
LinkedIn Bio: ${lead.linkedin_bio || 'Not provided'}

RULE-BASED CONTEXT:
- Role Classification: ${ruleScore?.breakdown?.role?.category || 'unknown'} (${ruleScore?.breakdown?.role?.reasoning || 'no analysis'})
- Industry Match: ${ruleScore?.breakdown?.industry?.match_type || 'unknown'} (${ruleScore?.breakdown?.industry?.reasoning || 'no analysis'})
- Profile Completeness: ${ruleScore?.breakdown?.completeness?.percentage || 0}%

ANALYSIS TASK:
Based on the prospect's profile, role, company context, and LinkedIn bio, classify their buying intent as High, Medium, or Low. Consider:

1. **Role Relevance**: Do they have decision-making power or influence over purchasing decisions?
2. **Industry Fit**: How well does their industry align with our ideal use cases?
3. **Pain Points**: Does their bio or role suggest they face problems our product solves?
4. **Company Context**: Are they at a company size/stage that would benefit from our solution?
5. **Timing Signals**: Any indicators of growth, expansion, or current challenges?

RESPONSE FORMAT:
INTENT: [High/Medium/Low]
REASONING: [Provide 1-2 sentences explaining your classification, focusing on the most important factors that influenced your decision]

Example:
INTENT: High
REASONING: VP of Sales at a mid-market SaaS company with bio mentioning "scaling outreach efforts" - perfect role authority and explicit pain point alignment with automation solution.`;
}

/**
 * Calls the OpenAI API to analyze lead intent with retry logic.
 * @param {string} prompt - The prompt to send to the AI.
 * @param {number} retries - Number of retries for API calls.
 * @returns {Promise<string>} The AI's raw text response.
 * @throws {Error} If the OpenAI API call fails after all retries.
 */
async function analyzeLeadIntent(prompt, retries = 3) {
  if (!groq) {
    initializeGroqClient();
  }

  for (let i = 0; i < retries; i++) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant", // Updated to llama-3.1-8b-instant
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 150,
      });
      const rawResponse = completion.choices[0].message.content;
      return rawResponse;
    } catch (error) {
      console.error(`Groq API call failed (attempt ${i + 1}/${retries}):`, error.message);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      } else {
        throw new Error(`Failed to get AI intent after ${retries} attempts: ${error.message}`);
      }
    }
  }
}

/**
 * Parses the AI's raw text response to extract intent and reasoning.
 * @param {string} aiResponse - The raw text response from the AI.
 * @returns {{intent: string, reasoning: string}} The extracted intent and reasoning.
 */
function parseAIResponse(aiResponse) {
  const intentMatch = aiResponse.match(/INTENT:\s*(High|Medium|Low)/i); // Removed square brackets
  const reasoningMatch = aiResponse.match(/REASONING:\s*(.*)/i);

  const intent = intentMatch ? intentMatch[1].toLowerCase() : 'unknown';
  const reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'No reasoning provided.';

  return { intent, reasoning };
}

/**
 * Converts AI intent classification to a numerical score.
 * @param {string} intent - The AI's intent classification (High, Medium, Low).
 * @returns {number} The numerical score.
 */
function convertIntentToScore(intent) {
  switch (intent.toLowerCase()) {
    case 'high':
      return 50;
    case 'medium':
      return 30;
    case 'low':
      return 10;
    default:
      return 0;
  }
}

/**
 * Processes a single lead through the AI analysis pipeline.
 * @param {Object} lead - The lead object.
 * @param {Object} offer - The offer object.
 * @param {Object} ruleScore - The rule-based score breakdown.
 * @returns {Promise<{aiScore: number, aiIntent: string, aiReasoning: string, logs: string[]}>} AI scoring results.
 */
async function getAiLeadScore(lead, offer, ruleScore) {
  const logs = [];
  let aiScore = 0;
  let aiIntent = 'unknown';
  let aiReasoning = 'AI analysis failed or not performed.';

  try {
    const prompt = createContextualPrompt(offer, lead, ruleScore);
    logs.push('AI Prompt created.');
    const aiResponse = await analyzeLeadIntent(prompt);
    logs.push('AI Response received.');
    const parsedResponse = parseAIResponse(aiResponse);
    aiIntent = parsedResponse.intent;
    aiReasoning = parsedResponse.reasoning;
    aiScore = convertIntentToScore(aiIntent);
    logs.push(`AI Intent: ${aiIntent}, AI Score: ${aiScore}`);
  } catch (error) {
    console.error('Error during AI lead scoring:', error.message);
    logs.push(`Error during AI lead scoring: ${error.message}`);
    aiIntent = 'error';
    aiReasoning = `Error: ${error.message}`;
    aiScore = 0;
  }

  return { aiScore, aiIntent, aiReasoning, logs };
}

/**
 * Batch processes multiple leads through AI analysis.
 * @param {Object[]} leads - An array of lead objects.
 * @param {Object} offer - The offer object.
 * @param {Object[]} ruleScores - An array of rule-based score breakdowns, corresponding to each lead.
 * @returns {Promise<Array<{aiScore: number, aiIntent: string, aiReasoning: string, logs: string[]}>>} Array of AI scoring results for each lead.
 */
async function batchProcessAiLeads(leads, offer, ruleScores) {
  const results = [];
  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const ruleScore = ruleScores[i];
    const aiResult = await getAiLeadScore(lead, offer, ruleScore);
    results.push(aiResult);
  }
  return results;
}


/**
 * Wrapper function to match the expected interface for scoring service.
 * @param {Object} lead - The lead object.
 * @param {Object} offer - The offer object.
 * @param {Object} ruleScore - Optional rule score breakdown for context.
 * @returns {Promise<{score: number, reasoning: string}>} AI scoring results in expected format.
 */
async function getAiScoreAndReasoning(lead, offer, ruleScore = null) {
  const result = await getAiLeadScore(lead, offer, ruleScore);
  return {
    score: result.aiScore,
    reasoning: result.aiReasoning
  };
}

module.exports = {
  initializeGroqClient, // Renamed for Groq
  createContextualPrompt,
  analyzeLeadIntent,
  parseAIResponse,
  convertIntentToScore,
  getAiLeadScore,
  getAiScoreAndReasoning,
  batchProcessAiLeads,
};
