/**
 * @fileoverview Service for classifying lead roles into categories (decision makers, influencers, others)
 * @module services/roleClassificationService
 */

/**
 * Keywords associated with decision-maker roles.
 * @type {string[]}
 */
const DECISION_MAKER_KEYWORDS = [
  "ceo",
  "cto",
  "cfo",
  "coo",
  "chief",
  "founder",
  "co-founder",
  "president",
  "vice president",
  "vp",
  "director",
  "head of",
  "owner",
  "principal",
  "partner",
];

/**
 * Keywords associated with influencer roles.
 * @type {string[]}
 */
const INFLUENCER_KEYWORDS = [
  "manager",
  "lead",
  "senior",
  "specialist",
  "architect",
  "consultant",
  "engineer",
];

/**
 * Scores for different role categories.
 * @type {Object.<string, number>}
 */
const ROLE_CATEGORY_SCORES = {
  decision_maker: 20,
  influencer: 10,
  other: 0,
};

/**
 * Classifies a lead's role into a category (decision_maker, influencer, other)
 * and provides a score and reasoning.
 * @param {string} role - The raw role string from the lead.
 * @returns {{category: string, score: number, reasoning: string}} The classification result.
 */
function classifyRole(role) {
  const normalizedRole = role.toLowerCase().trim();
  const matchedKeywords = [];

  for (const keyword of DECISION_MAKER_KEYWORDS) {
    if (normalizedRole.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }

  if (matchedKeywords.length > 0) {
    return {
      category: "decision_maker",
      score: ROLE_CATEGORY_SCORES.decision_maker,
      reasoning: `Classified as decision maker due to keywords: ${matchedKeywords.join(
        ", "
      )}`,
    };
  }

  for (const keyword of INFLUENCER_KEYWORDS) {
    if (normalizedRole.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }

  if (matchedKeywords.length > 0) {
    return {
      category: "influencer",
      score: ROLE_CATEGORY_SCORES.influencer,
      reasoning: `Classified as influencer due to keywords: ${matchedKeywords.join(
        ", "
      )}`,
    };
  }

  return {
    category: "other",
    score: ROLE_CATEGORY_SCORES.other,
    reasoning: "Classified as other, no specific keywords matched.",
  };
}

/**
 * Provides a detailed analysis of a lead's role for debugging purposes.
 * Includes original role, normalized role, classification, score, reasoning, and matched keywords.
 * @param {string} role - The raw role string from the lead.
 * @returns {{originalRole: string, normalizedRole: string, category: string, score: number, reasoning: string, matchedKeywords: string[]}} Detailed analysis.
 */
function detailedRoleAnalysis(role) {
  const normalizedRole = role.toLowerCase().trim();
  const { category, score, reasoning } = classifyRole(role);

  const matchedKeywords = [];
  const keywordsToCheck =
    category === "decision_maker"
      ? DECISION_MAKER_KEYWORDS
      : category === "influencer"
      ? INFLUENCER_KEYWORDS
      : [];

  for (const keyword of keywordsToCheck) {
    if (normalizedRole.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }

  return {
    originalRole: role,
    normalizedRole,
    category,
    score,
    reasoning,
    matchedKeywords,
  };
}

module.exports = {
  classifyRole,
  detailedRoleAnalysis,
};
