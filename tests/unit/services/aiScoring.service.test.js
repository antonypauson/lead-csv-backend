/**
 * @fileoverview Simple unit tests for the aiScoringService - Basic functionality only.
 * @module tests/unit/services/aiScoringService.test
 */

const {
  parseAIResponse,
  convertIntentToScore
} = require('../../../src/services/aiScoring.service');

describe('aiScoringService - Basic Tests', () => {

  describe('parseAIResponse', () => {
    test('should parse High intent correctly', () => {
      const aiResponse = 'INTENT: [High]\nREASONING: CEO at tech company.';
      const result = parseAIResponse(aiResponse);

      expect(result.intent).toBe('high');
      expect(result.reasoning).toContain('CEO at tech company');
    });

    test('should parse Medium intent correctly', () => {
      const aiResponse = 'INTENT: [Medium]\nREASONING: Manager role.';
      const result = parseAIResponse(aiResponse);

      expect(result.intent).toBe('medium');
    });

    test('should parse Low intent correctly', () => {
      const aiResponse = 'INTENT: [Low]\nREASONING: Not a good fit.';
      const result = parseAIResponse(aiResponse);

      expect(result.intent).toBe('low');
    });

    test('should handle malformed response', () => {
      const aiResponse = 'This is not a proper response';
      const result = parseAIResponse(aiResponse);

      expect(result.intent).toBe('unknown');
      expect(result.reasoning).toBe('No reasoning provided.');
    });
  });

  describe('convertIntentToScore', () => {
    test('should convert intents to correct scores', () => {
      expect(convertIntentToScore('high')).toBe(50);
      expect(convertIntentToScore('High')).toBe(50);
      expect(convertIntentToScore('medium')).toBe(30);
      expect(convertIntentToScore('Medium')).toBe(30);
      expect(convertIntentToScore('low')).toBe(10);
      expect(convertIntentToScore('Low')).toBe(10);
      expect(convertIntentToScore('unknown')).toBe(0);
      expect(convertIntentToScore('invalid')).toBe(0);
    });
  });

  describe('Basic functionality verification', () => {
    test('should have required functions exported', () => {
      expect(typeof parseAIResponse).toBe('function');
      expect(typeof convertIntentToScore).toBe('function');
    });

    test('should parse and convert complete workflow', () => {
      // Test the complete parsing and scoring workflow
      const mockAIResponse = 'INTENT: [High]\nREASONING: Perfect fit for our solution.';

      const parsed = parseAIResponse(mockAIResponse);
      const score = convertIntentToScore(parsed.intent);

      expect(parsed.intent).toBe('high');
      expect(parsed.reasoning).toBe('Perfect fit for our solution.');
      expect(score).toBe(50);
    });

    test('should handle edge cases in parsing', () => {
      const testCases = [
        {
          input: 'INTENT: [MEDIUM]\nREASONING: Case insensitive test.',
          expectedIntent: 'medium',
          expectedScore: 30
        },
        {
          input: 'INTENT: [low]\nREASONING: Lowercase test.',
          expectedIntent: 'low',
          expectedScore: 10
        },
        {
          input: 'No proper format here',
          expectedIntent: 'unknown',
          expectedScore: 0
        }
      ];

      testCases.forEach(({ input, expectedIntent, expectedScore }) => {
        const parsed = parseAIResponse(input);
        const score = convertIntentToScore(parsed.intent);

        expect(parsed.intent).toBe(expectedIntent);
        expect(score).toBe(expectedScore);
      });
    });
  });
});