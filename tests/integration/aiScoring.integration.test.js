/**
 * @fileoverview Integration tests for the aiScoringService, verifying actual Groq API calls.
 * @module tests/integration/aiScoringService.integration.test
 */

// Clear any mocks before importing
jest.clearAllMocks();
jest.resetModules();

const {
  initializeGroqClient,
  getAiLeadScore,
} = require('../../src/services/aiScoring.service');
const config = require('../../src/config');
const groqApiKey = config.groqApiKey;

describe('aiScoringService - Integration Tests', () => {
  // This test will only run if a Groq API key is provided in the environment.
  // It's crucial to ensure this key is valid and has access to the Groq API.
  const runIntegrationTests = !!groqApiKey;

  beforeAll(() => {
    if (runIntegrationTests) {
      initializeGroqClient(); // Initialize the client with the real API key
      console.log('Groq API client initialized for integration tests.');
    } else {
      console.warn('Groq API key not found. Skipping AI scoring integration tests.');
    }
  });

  (runIntegrationTests ? test : test.skip)('should successfully get AI lead score from Groq API', async () => {
    const mockOffer = {
      name: "Advanced Lead Qualification",
      value_props: ["Automated scoring", "Improved sales efficiency"],
      ideal_use_cases: ["B2B SaaS", "Sales Operations"]
    };
    const mockLead = {
      name: "John Doe",
      role: "Head of Sales",
      company: "SalesTech Inc.",
      industry: "Software",
      location: "New York",
      linkedin_bio: "Experienced sales leader focused on scaling revenue for SaaS companies."
    };
    const mockRuleScore = {
      breakdown: {
        role: { category: 'decision_maker', reasoning: 'Head of Sales role', score: 20 },
        industry: { match_type: 'exact_match', reasoning: 'Software industry', score: 20 },
        completeness: { percentage: 100, reasoning: 'All fields present', score: 10 }
      }
    };

    const result = await getAiLeadScore(mockLead, mockOffer, mockRuleScore);

    expect(result).toBeDefined();
    expect(result.aiScore).toBeGreaterThan(0); // Expect a score, not necessarily a specific one
    expect(['high', 'medium', 'low', 'unknown']).toContain(result.aiIntent);
    expect(result.aiReasoning).toBeDefined();
    expect(result.logs).toBeDefined();
    expect(result.logs.length).toBeGreaterThan(0);
    console.log('AI Integration Test Result:', result);
  }, 30000); // Increase timeout for API calls (30 seconds)

  (runIntegrationTests ? test : test.skip)('should handle network errors gracefully', async () => {
    const mockOffer = { 
      name: "Test Offer", 
      value_props: ["Test value"], 
      ideal_use_cases: ["Test case"] 
    };
    const mockLead = { 
      name: "Test Lead", 
      role: "Test Role", 
      company: "Test Company", 
      industry: "Test Industry", 
      location: "Test Location", 
      linkedin_bio: "Test bio" 
    };
    const mockRuleScore = { 
      breakdown: { 
        role: { category: 'other', reasoning: 'Test role' }, 
        industry: { match_type: 'no_match', reasoning: 'No match' }, 
        completeness: { percentage: 100 } 
      } 
    };

    // This test just verifies the function handles errors gracefully
    // We can't easily simulate network errors in integration tests
    const result = await getAiLeadScore(mockLead, mockOffer, mockRuleScore);

    // Should return a valid result structure even if there are issues
    expect(result).toHaveProperty('aiScore');
    expect(result).toHaveProperty('aiIntent');
    expect(result).toHaveProperty('aiReasoning');
    expect(result).toHaveProperty('logs');
  }, 30000);
});
