/**
 * @fileoverview Service for matching lead industries with offer's ideal use cases.
 * @module services/industryMatchingService
 */

/**
 * Industry scores based on relevance to ideal use cases.
 * @type {Object.<string, number>}
 */
const INDUSTRY_SCORES = {
  exact_match: 20,
  adjacent: 10,
  no_match: 0,
};

/**
 * Industry synonyms to facilitate broader matching.
 * @type {Object.<string, string[]>}
 */
const INDUSTRY_SYNONYMS = {
  // Software and Technology
  software: [
    "saas",
    "tech",
    "technology",
    "software development",
    "it services",
    "information technology",
  ],
  saas: ["software", "software as a service", "cloud software", "tech"],
  technology: ["tech", "software", "it", "information technology"],
  fintech: [
    "financial technology",
    "finance",
    "banking",
    "payments",
    "financial services",
  ],

  // Business Services
  consulting: ["professional services", "business consulting", "advisory"],
  marketing: ["advertising", "digital marketing", "martech", "ad tech"],
  sales: ["business development", "revenue", "sales automation"],

  // Industries
  healthcare: ["health", "medical", "pharma", "pharmaceutical", "biotech"],
  education: ["edtech", "e-learning", "learning", "training"],
  ecommerce: ["e-commerce", "retail", "online retail", "marketplace"],
  manufacturing: ["industrial", "production", "logistics", "supply chain"],
  finance: ["financial", "banking", "fintech", "investment"],

  // Company Types
  b2b: ["business to business", "enterprise", "b2b saas"],
  enterprise: ["large enterprise", "fortune 500", "big business"],
  startup: ["early stage", "seed", "series a", "scale-up"],
  "mid-market": ["mid market", "middle market", "smb", "small medium business"],
};

/**
 * Normalizes a string by converting to lowercase and trimming whitespace.
 * @param {string} text - The input string.
 * @returns {string} The normalized string.
 */
function _normalizeString(text) {
  return text ? text.toLowerCase().trim() : "";
}

/**
 * Matches the lead's industry with the offer's ideal use cases and returns a score and reasoning.
 * @param {string} leadIndustry - The industry of the lead.
 * @param {string[]} idealUseCases - Array of ideal use cases from the offer.
 * @returns {{matchType: string, score: number, reasoning: string, matchedKeywords: string[]}} The industry match result.
 */
function matchIndustry(leadIndustry, idealUseCases) {
  const normalizedLeadIndustry = _normalizeString(leadIndustry);
  const normalizedUseCases = idealUseCases.map(_normalizeString);
  const matchedKeywords = new Set();

  // Input Validation
  if (!normalizedLeadIndustry || normalizedUseCases.length === 0) {
    return {
      matchType: "no_match",
      score: INDUSTRY_SCORES.no_match,
      reasoning: "No industry information or ideal use cases provided",
      matchedKeywords: [],
    };
  }

  // Exact Match Logic (Score: 20)
  for (const useCase of normalizedUseCases) {
    if (normalizedLeadIndustry.includes(useCase) || useCase.includes(normalizedLeadIndustry)) {
      matchedKeywords.add(useCase);
      return {
        matchType: 'exact',
        score: INDUSTRY_SCORES.exact_match,
        reasoning: `Exact industry match: "${leadIndustry}" matches "${useCase}"`,
        matchedKeywords: Array.from(matchedKeywords)
      };
    }
  }

  // Adjacent Match Logic - Synonyms (Score: 10)
  for (const useCase of normalizedUseCases) {
    const synonyms = INDUSTRY_SYNONYMS[useCase];
    if (synonyms) {
      for (const synonym of synonyms) {
        if (
          normalizedLeadIndustry.includes(synonym) ||
          synonym.includes(normalizedLeadIndustry)
        ) {
          matchedKeywords.add(synonym);
          return {
            matchType: "adjacent",
            score: INDUSTRY_SCORES.adjacent,
            reasoning: `Adjacent industry match: "${leadIndustry}" is a synonym of "${useCase}" via "${synonym}"`,
            matchedKeywords: Array.from(matchedKeywords),
          };
        }
      }
    }
  }

  // Adjacent Match Logic - Partial/Fuzzy (Score: 10)
  // If common words are there, give 'adjacent' match
  // Only consider words longer than 2 characters for partial matching.
  const leadIndustryWords = normalizedLeadIndustry
    .split(/\s+/)
    .filter((word) => word.length > 2);
  for (const useCase of normalizedUseCases) {
    const useCaseWords = useCase.split(/\s+/).filter((word) => word.length > 2);
    const commonWords = leadIndustryWords.filter((word) =>
      useCaseWords.includes(word)
    );

    if (commonWords.length > 0) {
      commonWords.forEach((word) => matchedKeywords.add(word));
      return {
        matchType: "adjacent",
        score: INDUSTRY_SCORES.adjacent,
        reasoning: `Partial industry match: "${leadIndustry}" shares keywords with ideal use cases`,
        matchedKeywords: Array.from(matchedKeywords),
      };
    }
  }

  // No Match Logic (Score: 0)
  return {
    matchType: "no_match",
    score: INDUSTRY_SCORES.no_match,
    reasoning:
      "No exact, synonym, or significant partial industry match found.",
    matchedKeywords: [],
  };
}

module.exports = {
  matchIndustry
};
