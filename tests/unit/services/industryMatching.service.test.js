/**
 * @fileoverview Unit tests for the industryMatchingService.
 * @module tests/unit/services/industryMatchingService.test
 */

const { matchIndustry, INDUSTRY_SCORES, INDUSTRY_SYNONYMS } = require('../../../src/services/industryMatching.service');

describe('industryMatchingService', () => {
  describe('matchIndustry', () => {
    test('should return no_match if leadIndustry is empty', () => {
      const result = matchIndustry('', ['software']);
      expect(result.matchType).toBe('no_match');
      expect(result.score).toBe(INDUSTRY_SCORES.no_match);
      expect(result.reasoning).toBe('No industry information or ideal use cases provided');
      expect(result.matchedKeywords).toEqual([]);
    });

    test('should return no_match if idealUseCases is empty', () => {
      const result = matchIndustry('software', []);
      expect(result.matchType).toBe('no_match');
      expect(result.score).toBe(INDUSTRY_SCORES.no_match);
      expect(result.reasoning).toBe('No industry information or ideal use cases provided');
      expect(result.matchedKeywords).toEqual([]);
    });

    test('should return exact match for direct inclusion (leadIndustry in useCase)', () => {
      const result = matchIndustry('software development', ['software']);
      expect(result.matchType).toBe('exact');
      expect(result.score).toBe(INDUSTRY_SCORES.exact_match);
      expect(result.reasoning).toContain('Exact industry match');
      expect(result.matchedKeywords).toEqual(['software']);
    });

    test('should return exact match for direct inclusion (useCase in leadIndustry)', () => {
      const result = matchIndustry('software', ['software development']);
      expect(result.matchType).toBe('exact');
      expect(result.score).toBe(INDUSTRY_SCORES.exact_match);
      expect(result.reasoning).toContain('Exact industry match');
      expect(result.matchedKeywords).toEqual(['software development']);
    });

    test('should return exact match for identical strings', () => {
      const result = matchIndustry('fintech', ['fintech']);
      expect(result.matchType).toBe('exact');
      expect(result.score).toBe(INDUSTRY_SCORES.exact_match);
      expect(result.reasoning).toContain('Exact industry match');
      expect(result.matchedKeywords).toEqual(['fintech']);
    });

    test('should handle case insensitivity for exact match', () => {
      const result = matchIndustry('Software', ['software development']);
      expect(result.matchType).toBe('exact');
      expect(result.score).toBe(INDUSTRY_SCORES.exact_match);
      expect(result.reasoning).toContain('Exact industry match');
      expect(result.matchedKeywords).toEqual(['software development']);
    });

    test('should return adjacent match for synonyms (leadIndustry is synonym)', () => {
      const result = matchIndustry('cloud software', ['saas']);
      expect(result.matchType).toBe('adjacent');
      expect(result.score).toBe(INDUSTRY_SCORES.adjacent);
      expect(result.reasoning).toContain('Adjacent industry match');
      expect(result.reasoning).toContain('saas');
      expect(result.matchedKeywords).toEqual(['software']);
    });

    test('should return adjacent match for synonyms (useCase is synonym)', () => {
      const result = matchIndustry('tech', ['software development']);
      expect(result.matchType).toBe('adjacent');
      expect(result.score).toBe(INDUSTRY_SCORES.adjacent);
      expect(result.reasoning).toContain('Adjacent industry match');
      expect(result.reasoning).toContain('software development');
      expect(result.matchedKeywords).toEqual(['tech', 'software development']); 
    });

    test('should return adjacent match for partial word overlap (leadIndustry words in useCase) - now a synonym match', () => {
      const result = matchIndustry('digital advertising', ['marketing']);
      expect(result.matchType).toBe('adjacent');
      expect(result.score).toBe(INDUSTRY_SCORES.adjacent);
      expect(result.reasoning).toContain('Adjacent industry match');
      expect(result.reasoning).toContain('advertising');
      expect(result.matchedKeywords).toEqual(['advertising']);
    });

    test('should return adjacent match for partial word overlap (useCase words in leadIndustry)', () => {
      const result = matchIndustry('marketing solutions', ['digital marketing']);
      expect(result.matchType).toBe('adjacent');
      expect(result.score).toBe(INDUSTRY_SCORES.adjacent);
      expect(result.reasoning).toContain('Partial industry match');
      expect(result.matchedKeywords).toEqual(['marketing']);
    });

    test('should return no_match if no exact, synonym, or significant partial match', () => {
      const result = matchIndustry('agriculture', ['software', 'fintech']);
      expect(result.matchType).toBe('no_match');
      expect(result.score).toBe(INDUSTRY_SCORES.no_match);
      expect(result.reasoning).toBe('No exact, synonym, or significant partial industry match found.');
      expect(result.matchedKeywords).toEqual([]);
    });

    test('should prioritize exact match over adjacent match', () => {
      const result = matchIndustry('saas', ['software', 'saas']);
      expect(result.matchType).toBe('exact');
      expect(result.score).toBe(INDUSTRY_SCORES.exact_match);
      expect(result.reasoning).toContain('Exact industry match');
      expect(result.matchedKeywords).toEqual(['saas']);
    });

    test('should handle multiple ideal use cases for exact match', () => {
      const result = matchIndustry('healthcare tech', ['fintech', 'healthcare']);
      expect(result.matchType).toBe('exact');
      expect(result.score).toBe(INDUSTRY_SCORES.exact_match);
      expect(result.reasoning).toContain('healthcare');
      expect(result.matchedKeywords).toEqual(['healthcare']);
    });

    test('should handle multiple ideal use cases for synonym match', () => {
      const result = matchIndustry('it services', ['fintech', 'software']);
      expect(result.matchType).toBe('adjacent');
      expect(result.score).toBe(INDUSTRY_SCORES.adjacent);
      expect(result.reasoning).toContain('software');
      expect(result.matchedKeywords).toEqual(['it services']);
    });

    test('should handle complex partial matches - now no_match with current logic', () => {
      const result = matchIndustry('enterprise cloud solutions', ['b2b saas']);
      expect(result.matchType).toBe('no_match'); 
      expect(result.score).toBe(INDUSTRY_SCORES.no_match); 
      expect(result.reasoning).toBe('No exact, synonym, or significant partial industry match found.'); 
      expect(result.matchedKeywords).toEqual([]); 
    });
  });
});
