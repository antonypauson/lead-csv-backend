/**
 * @fileoverview Unit tests for the ruleScoringService.
 * @module tests/unit/services/ruleScoringService.test
 */

const { calculateRuleScore, MAX_RULE_SCORE } = require('../../../src/services/ruleScoring.service');

describe('ruleScoringService', () => {
  // Sample offer for testing
  const sampleOffer = {
    name: "AI Outreach Automation",
    value_props: ["24/7 outreach", "6x more meetings"],
    ideal_use_cases: ["B2B SaaS mid-market", "Software", "Technology"]
  };

  // Test scenarios with exact expected values
  const testScenarios = [
    {
      description: 'should calculate score for perfect lead (CEO + exact match + complete data)',
      lead: {
        name: "John Smith",
        role: "CEO",
        company: "TechStart Inc",
        industry: "Software",
        location: "San Francisco",
        linkedin_bio: "Tech entrepreneur with 15+ years experience"
      },
      offer: sampleOffer,
      expectedTotalScore: 50, // 20 (CEO) + 20 (exact match) + 10 (complete)
      expectedRoleScore: 20,
      expectedIndustryScore: 20,
      expectedCompletenessScore: 10,
      expectedLogs: [
        "Role Scoring: Classified as decision maker due to keywords: ceo (Score: 20)",
        "Industry Scoring: Exact industry match:",
        "Completeness Scoring: Lead data is complete. (Score: 10)"
      ]
    },
    {
      description: 'should calculate score for good lead (VP + synonym match + complete data)',
      lead: {
        name: "Sarah Johnson",
        role: "VP Sales",
        company: "DataFlow",
        industry: "SaaS",
        location: "New York",
        linkedin_bio: "Sales leader with B2B experience"
      },
      offer: sampleOffer,
      expectedTotalScore: 50, // 20 (VP) + 20 (exact match) + 10 (complete)
      expectedRoleScore: 20,
      expectedIndustryScore: 20,
      expectedCompletenessScore: 10,
      expectedLogs: [
        "Role Scoring: Classified as decision maker due to keywords: vp (Score: 20)",
        "Industry Scoring: Exact industry match:",
        "Completeness Scoring: Lead data is complete. (Score: 10)"
      ]
    },
    {
      description: 'should calculate score for average lead (Manager + partial match + complete data)',
      lead: {
        name: "Mike Manager",
        role: "Marketing Manager",
        company: "GrowthCorp",
        industry: "Technology",
        location: "Austin",
        linkedin_bio: "Marketing professional"
      },
      offer: sampleOffer,
      expectedTotalScore: 40, // 10 (Manager) + 20 (exact match) + 10 (complete)
      expectedRoleScore: 10,
      expectedIndustryScore: 20,
      expectedCompletenessScore: 10,
      expectedLogs: [
        "Role Scoring: Classified as influencer due to keywords: manager (Score: 10)",
        "Industry Scoring: Exact industry match:",
        "Completeness Scoring: Lead data is complete. (Score: 10)"
      ]
    },
    {
      description: 'should calculate score for poor lead (Engineer + no industry match + incomplete data)',
      lead: {
        name: "Jane Developer",
        role: "Software Engineer",
        company: "CodeCorp",
        industry: "Healthcare",
        location: "Boston",
        linkedin_bio: "" // Missing bio
      },
      offer: sampleOffer,
      expectedTotalScore: 10, // 10 (Engineer=influencer) + 0 (no match) + 0 (incomplete)
      expectedRoleScore: 10,
      expectedIndustryScore: 0,
      expectedCompletenessScore: 0,
      expectedLogs: [
        "Role Scoring: Classified as influencer due to keywords: engineer (Score: 10)",
        "Industry Scoring: No exact, synonym, or significant partial industry match found. (Score: 0)",
        "Completeness Scoring: Lead data is incomplete. Missing fields: linkedin_bio. (Score: 0)"
      ]
    },
    {
      description: 'should calculate score for incomplete lead (empty role + empty industry + missing fields)',
      lead: {
        name: "Bob Wilson",
        role: "",
        company: "TestCorp",
        industry: "",
        location: "",
        linkedin_bio: ""
      },
      offer: sampleOffer,
      expectedTotalScore: 0, // 0 (no role) + 0 (no industry) + 0 (incomplete)
      expectedRoleScore: 0,
      expectedIndustryScore: 0,
      expectedCompletenessScore: 0,
      expectedLogs: [
        "Role Scoring: Classified as other, no specific keywords matched. (Score: 0)",
        "Industry Scoring: No industry information or ideal use cases provided (Score: 0)",
        "Completeness Scoring: Lead data is incomplete. Missing fields: role, industry, location, linkedin_bio. (Score: 0)"
      ]
    }
  ];

  describe('calculateRuleScore', () => {
    testScenarios.forEach(({ description, lead, offer, expectedTotalScore, expectedRoleScore, expectedIndustryScore, expectedCompletenessScore, expectedLogs }) => {
      test(description, () => {
        const result = calculateRuleScore(lead, offer);

        // Test exact scores
        expect(result.totalScore).toBe(expectedTotalScore);
        expect(result.breakdown.role.score).toBe(expectedRoleScore);
        expect(result.breakdown.industry.score).toBe(expectedIndustryScore);
        expect(result.breakdown.completeness.score).toBe(expectedCompletenessScore);

        // Test log structure
        expect(result.logs).toHaveLength(expectedLogs.length);
        expectedLogs.forEach((expectedLog, index) => {
          expect(result.logs[index]).toContain(expectedLog);
        });

        // Test breakdown structure
        if (lead && typeof lead === 'object' && offer && typeof offer === 'object' && offer.ideal_use_cases) {
          expect(result.breakdown).toHaveProperty('role');
          expect(result.breakdown).toHaveProperty('industry');
          expect(result.breakdown).toHaveProperty('completeness');
        }
      });
    });

    test('should not exceed MAX_RULE_SCORE', () => {
      const perfectLead = {
        name: "Perfect Lead",
        role: "CEO",
        company: "Perfect Corp",
        industry: "Software",
        location: "Perfect City",
        linkedin_bio: "Perfect bio"
      };

      const result = calculateRuleScore(perfectLead, sampleOffer);
      expect(result.totalScore).toBeLessThanOrEqual(MAX_RULE_SCORE);
      expect(MAX_RULE_SCORE).toBe(50);
    });

    test('should handle invalid lead object', () => {
      const result = calculateRuleScore(null, sampleOffer);
      
      expect(result.totalScore).toBe(0);
      expect(result.breakdown).toEqual({});
      expect(result.logs).toContain('Error: Invalid lead object provided.');
    });

    test('should handle invalid offer object', () => {
      const validLead = {
        name: "Test Lead",
        role: "CEO",
        company: "Test Corp",
        industry: "Software",
        location: "Test City",
        linkedin_bio: "Test bio"
      };

      const result = calculateRuleScore(validLead, null);
      
      expect(result.totalScore).toBe(0);
      expect(result.breakdown).toEqual({});
      expect(result.logs).toContain('Error: Invalid offer object or missing ideal_use_cases provided.');
    });

    test('should handle offer without ideal_use_cases', () => {
      const validLead = {
        name: "Test Lead",
        role: "CEO",
        company: "Test Corp",
        industry: "Software",
        location: "Test City",
        linkedin_bio: "Test bio"
      };
      const invalidOffer = { name: "Test", value_props: ["test"] };

      const result = calculateRuleScore(validLead, invalidOffer);
      
      expect(result.totalScore).toBe(0);
      expect(result.logs).toContain('Error: Invalid offer object or missing ideal_use_cases provided.');
    });
  });

  describe('Score Distribution Demo', () => {
    test('should demonstrate scoring with console output', () => {
      console.log('\n=== RULE SCORING TEST RESULTS ===\n');
      
      testScenarios.forEach(({ description, lead, offer }) => {
        const result = calculateRuleScore(lead, offer);
        
        console.log(`--- ${lead.name} (${lead.role || 'No Role'}) ---`);
        console.log(`Total Score: ${result.totalScore}/${MAX_RULE_SCORE}`);
        console.log(`Role: ${result.breakdown.role.score} points (${result.breakdown.role.reasoning})`);
        console.log(`Industry: ${result.breakdown.industry.score} points (${result.breakdown.industry.reasoning})`);
        console.log(`Completeness: ${result.breakdown.completeness.score} points (${result.breakdown.completeness.reasoning})`);
        console.log('');
      });
    });
  });
});
