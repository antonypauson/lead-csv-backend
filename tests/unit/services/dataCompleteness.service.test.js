/**
 * @fileoverview Unit tests for the dataCompletenessService.
 * @module tests/unit/services/dataCompletenessService.test
 */

const { checkCompleteness, COMPLETENESS_SCORE, REQUIRED_LEAD_FIELDS } = require('../../../src/services/dataCompleteness.service');

describe('dataCompletenessService', () => {
  describe('checkCompleteness', () => {
    test('should return complete for a lead with all required fields', () => {
      const lead = {
        name: 'Parthiv Patel',
        role: 'ceo',
        company: 'P industries',
        industry: 'Software',
        location: 'San Francisco Bay',
        linkedin_bio: 'Experienced leader in SaaS.',
      };
      const result = checkCompleteness(lead);
      expect(result.score).toBe(COMPLETENESS_SCORE);
      expect(result.reasoning).toBe('Lead data is complete.');
      expect(result.missingFields).toEqual([]);
    });

    test('should return incomplete for a lead with a missing field', () => {
      const lead = {
        name: 'Bilbo Baggins',
        role: 'CTO',
        company: 'Shire Inc.',
        industry: 'AI',
        location: 'Shire',
        // linkedin_bio is missing
      };
      const result = checkCompleteness(lead);
      expect(result.score).toBe(0);
      expect(result.reasoning).toContain('Lead data is incomplete.');
      expect(result.reasoning).toContain('linkedin_bio');
      expect(result.missingFields).toEqual(['linkedin_bio']);
    });

    test('should return incomplete for a lead with multiple missing fields', () => {
      const lead = {
        name: 'Frodo Baggins',
        // role is missing
        company: 'Shire Inc',
        industry: 'Consulting',
        // location is missing
        linkedin_bio: 'Consulting expert. Destroyed the RING',
      };
      const result = checkCompleteness(lead);
      expect(result.score).toBe(0);
      expect(result.reasoning).toContain('Lead data is incomplete.');
      expect(result.reasoning).toContain('role');
      expect(result.reasoning).toContain('location');
      expect(result.missingFields).toEqual(['role', 'location']);
    });

    test('should treat empty string fields as missing', () => {
      const lead = {
        name: 'Gordan Ramsay',
        role: '', // Empty string
        company: 'Data Analytics',
        industry: 'Big Data',
        location: 'Hells Kitchen',
        linkedin_bio: 'Chef.',
      };
      const result = checkCompleteness(lead);
      expect(result.score).toBe(0);
      expect(result.reasoning).toContain('Lead data is incomplete.');
      expect(result.reasoning).toContain('role');
      expect(result.missingFields).toEqual(['role']);
    });

    test('should treat whitespace-only string fields as missing', () => {
      const lead = {
        name: 'Charlie',
        role: '  ', // Whitespace only
        company: 'Chocolate Facotry',
        industry: 'Creative',
        location: 'London',
        linkedin_bio: 'Graphic designer.',
      };
      const result = checkCompleteness(lead);
      expect(result.score).toBe(0);
      expect(result.reasoning).toContain('Lead data is incomplete.');
      expect(result.reasoning).toContain('role');
      expect(result.missingFields).toEqual(['role']);
    });

    test('should return complete for a lead with all fields present, even if some are optional (not in REQUIRED_LEAD_FIELDS)', () => {
      const lead = {
        name: 'Eve',
        role: 'Product Manager',
        company: 'Eve Co.',
        industry: 'Software',
        location: 'Texas',
        linkedin_bio: 'Product visionary.',
        email: 'eve@example.com', // Optional field
      };
      const result = checkCompleteness(lead);
      expect(result.score).toBe(COMPLETENESS_SCORE);
      expect(result.reasoning).toBe('Lead data is complete.');
      expect(result.missingFields).toEqual([]);
    });

    test('should handle lead object with no fields', () => {
      const lead = {};
      const result = checkCompleteness(lead);
      expect(result.score).toBe(0);
      expect(result.reasoning).toContain('Lead data is incomplete.');
      expect(result.missingFields).toEqual(REQUIRED_LEAD_FIELDS);
    });
  });
});
