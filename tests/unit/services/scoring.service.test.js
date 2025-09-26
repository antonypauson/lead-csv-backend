/**
 * @file scoring.service.test.js
 * @description Unit tests for the scoring service.
 */

const scoringService = require('../../../src/services/scoring.service');
const offerService = require('../../../src/services/offer.service');
const leadsService = require('../../../src/services/leads.service');
const ruleScoringService = require('../../../src/services/ruleScoring.service');
const aiScoringService = require('../../../src/services/aiScoring.service');
const { v4: uuidv4 } = require('uuid');

// Mock dependencies
jest.mock('../../../src/services/offer.service', () => ({
  getOfferById: jest.fn(),
}));
jest.mock('../../../src/services/leads.service', () => ({
  getLeadsByIds: jest.fn(),
}));
jest.mock('../../../src/services/ruleScoring.service', () => ({
  scoreLead: jest.fn(),
}));
jest.mock('../../../src/services/aiScoring.service', () => ({
  getAiScoreAndReasoning: jest.fn(),
}));
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('Scoring Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockOffer = {
    id: 'offer-123',
    name: 'Premium Software',
    value_props: ['High ROI', 'Scalability'],
    ideal_use_cases: ['Enterprise Solutions', 'Data Analytics'],
  };

  const mockLeads = [
    {
      id: 'lead-1',
      name: 'John Doe',
      role: 'CEO',
      company: 'TechCorp',
      industry: 'Software',
      location: 'San Francisco',
      linkedin_bio: 'Experienced CEO in SaaS...',
    },
    {
      id: 'lead-2',
      name: 'Jane Smith',
      role: 'Manager',
      company: 'Innovate Ltd',
      industry: 'Retail',
      location: 'New York',
      linkedin_bio: 'Driving innovation in retail...',
    },
  ];

  describe('calculateFinalIntent', () => {
    test('should return "High" for scores >= 70', () => {
      expect(scoringService.calculateFinalIntent(70)).toBe('High');
      expect(scoringService.calculateFinalIntent(85)).toBe('High');
    });

    test('should return "Medium" for scores >= 40 and < 70', () => {
      expect(scoringService.calculateFinalIntent(40)).toBe('Medium');
      expect(scoringService.calculateFinalIntent(65)).toBe('Medium');
    });

    test('should return "Low" for scores < 40', () => {
      expect(scoringService.calculateFinalIntent(39)).toBe('Low');
      expect(scoringService.calculateFinalIntent(10)).toBe('Low');
    });
  });

  describe('processLeadsForScoring', () => {
    test('should throw error if offer not found', async () => {
      offerService.getOfferById.mockReturnValue(null);

      await expect(scoringService.processLeadsForScoring('non-existent-offer', ['lead-1']))
        .rejects.toThrow('Offer with ID non-existent-offer not found.');
    });

    test('should throw error if some leads not found', async () => {
      offerService.getOfferById.mockReturnValue(mockOffer);
      leadsService.getLeadsByIds.mockReturnValue([mockLeads[0]]); // Only return one lead

      await expect(scoringService.processLeadsForScoring(mockOffer.id, ['lead-1', 'lead-2']))
        .rejects.toThrow('Some leads not found: lead-2');
    });

    test('should process leads and return scoring results', async () => {
      offerService.getOfferById.mockReturnValue(mockOffer);
      leadsService.getLeadsByIds.mockReturnValue(mockLeads);
      ruleScoringService.scoreLead.mockImplementation((lead) => (lead.id === 'lead-1' ? 50 : 20));
      aiScoringService.getAiScoreAndReasoning.mockImplementation(async (lead) =>
        lead.id === 'lead-1'
          ? { score: 30, reasoning: 'AI High' }
          : { score: 15, reasoning: 'AI Low' }
      );
      uuidv4.mockReturnValueOnce('result-1').mockReturnValueOnce('result-2');

      const results = await scoringService.processLeadsForScoring(mockOffer.id, ['lead-1', 'lead-2']);

      expect(offerService.getOfferById).toHaveBeenCalledWith(mockOffer.id);
      expect(leadsService.getLeadsByIds).toHaveBeenCalledWith(['lead-1', 'lead-2']);
      expect(ruleScoringService.scoreLead).toHaveBeenCalledTimes(2);
      expect(aiScoringService.getAiScoreAndReasoning).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(2);

      expect(results[0]).toMatchObject({
        id: 'result-1',
        leadId: 'lead-1',
        name: 'John Doe',
        intent: 'High',
        score: 80, // 50 (rule) + 30 (ai)
        rule_score: 50,
        ai_score: 30,
        reasoning: 'AI High',
      });

      expect(results[1]).toMatchObject({
        id: 'result-2',
        leadId: 'lead-2',
        name: 'Jane Smith',
        intent: 'Low',
        score: 35, // 20 (rule) + 15 (ai)
        rule_score: 20,
        ai_score: 15,
        reasoning: 'AI Low',
      });

      // Verify results are stored
      const storedResults = scoringService.getScoringResults();
      expect(storedResults).toHaveLength(2);
      expect(storedResults[0]).toMatchObject({ id: 'result-1' });
      expect(storedResults[1]).toMatchObject({ id: 'result-2' });
    });
  });

  describe('getScoringResults', () => {
    test('should return all stored scoring results', async () => {
      offerService.getOfferById.mockReturnValue(mockOffer);
      leadsService.getLeadsByIds.mockReturnValue(mockLeads);
      ruleScoringService.scoreLead.mockImplementation((lead) => (lead.id === 'lead-1' ? 50 : 20));
      aiScoringService.getAiScoreAndReasoning.mockImplementation(async (lead) =>
        lead.id === 'lead-1'
          ? { score: 30, reasoning: 'AI High' }
          : { score: 15, reasoning: 'AI Low' }
      );
      uuidv4.mockReturnValueOnce('result-1').mockReturnValueOnce('result-2');

      await scoringService.processLeadsForScoring(mockOffer.id, ['lead-1', 'lead-2']);

      const allResults = scoringService.getScoringResults();
      expect(allResults).toHaveLength(2);
      expect(allResults[0].id).toBe('result-1');
      expect(allResults[1].id).toBe('result-2');
    });
  });
});
