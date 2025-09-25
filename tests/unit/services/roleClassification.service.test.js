/**
 * @fileoverview Unit tests for the roleClassificationService.
 * @module tests/unit/services/roleClassificationService.test
 */

const {classifyRole,detailedRoleAnalysis} = require('../../../src/services/roleClassification.service');

//classify role
describe('roleClassificationService', () => {
  describe('classifyRole', () => {
    test('should classify a CEO as a decision_maker', () => {
      const result = classifyRole('CEO');
      expect(result.category).toBe('decision_maker');
      expect(result.score).toBe(20); // decision_maker is 20
      expect(result.reasoning).toContain('decision maker');
    });

    test('should classify a "Head of Marketing" as a decision_maker', () => {
      const result = classifyRole('Head of Marketing');
      expect(result.category).toBe('decision_maker');
      expect(result.score).toBe(20);
      expect(result.reasoning).toContain('head of');
    });

    test('should classify a "VP of Sales" as a decision_maker', () => {
      const result = classifyRole('VP of Sales');
      expect(result.category).toBe('decision_maker');
      expect(result.score).toBe(20);
      expect(result.reasoning).toContain('vp');
    });

    test('should classify a "Software Manager" as an influencer', () => {
      const result = classifyRole('Software Manager');
      expect(result.category).toBe('influencer');
      expect(result.score).toBe(10); // influencer is 10
      expect(result.reasoning).toContain('manager');
    });

    test('should classify a "Senior Developer" as an influencer', () => {
      const result = classifyRole('Senior Developer');
      expect(result.category).toBe('influencer');
      expect(result.score).toBe(10);
      expect(result.reasoning).toContain('senior');
    });

    test('should classify a "Lead Engineer" as an influencer', () => {
      const result = classifyRole('Lead Engineer');
      expect(result.category).toBe('influencer');
      expect(result.score).toBe(10);
      expect(result.reasoning).toContain('lead');
    });

    test('should classify an "Intern" as other', () => {
      const result = classifyRole('Intern');
      expect(result.category).toBe('other');
      expect(result.score).toBe(0); // other is 0
      expect(result.reasoning).toContain('other');
    });

    test('should handle case insensitivity', () => {
      const result = classifyRole('cEo');
      expect(result.category).toBe('decision_maker');
      expect(result.score).toBe(20);
    });

    test('should handle roles with extra spaces', () => {
      const result = classifyRole('  Director of Operations  ');
      expect(result.category).toBe('decision_maker');
      expect(result.score).toBe(20);
    });
  });

  //detailed role analysis
  describe('detailedRoleAnalysis', () => {
    test('should provide detailed analysis for a decision_maker role', () => {
      const role = 'Chief Technology Officer';
      const result = detailedRoleAnalysis(role);
      expect(result.originalRole).toBe(role);
      expect(result.normalizedRole).toBe('chief technology officer');
      expect(result.category).toBe('decision_maker');
      expect(result.score).toBe(20);
      expect(result.reasoning).toContain('chief');
      expect(result.matchedKeywords).toEqual(expect.arrayContaining(['chief'])); 
    });

    test('should provide detailed analysis for "VP of Engineering and Head of Product" as a decision_maker', () => {
      const role = 'VP of Engineering and Head of Product';
      const result = detailedRoleAnalysis(role);
      expect(result.originalRole).toBe(role);
      expect(result.normalizedRole).toBe('vp of engineering and head of product');
      expect(result.category).toBe('decision_maker');
      expect(result.score).toBe(20);
      expect(result.reasoning).toContain('vp');
      expect(result.reasoning).toContain('head of');
      expect(result.matchedKeywords).toEqual(expect.arrayContaining(['vp', 'head of']));
    });

    test('should provide detailed analysis for an influencer role', () => {
      const role = 'Project Manager';
      const result = detailedRoleAnalysis(role);
      expect(result.originalRole).toBe(role);
      expect(result.normalizedRole).toBe('project manager');
      expect(result.category).toBe('influencer');
      expect(result.score).toBe(10);
      expect(result.reasoning).toContain('manager');
      expect(result.matchedKeywords).toEqual(expect.arrayContaining(['manager']));
    });

    test('should provide detailed analysis for "Senior Manager Consultant" as an influencer', () => {
      const role = 'Senior Manager Consultant';
      const result = detailedRoleAnalysis(role);
      expect(result.originalRole).toBe(role);
      expect(result.normalizedRole).toBe('senior manager consultant');
      expect(result.category).toBe('influencer');
      expect(result.score).toBe(10);
      expect(result.reasoning).toContain('senior');
      expect(result.reasoning).toContain('manager');
      expect(result.reasoning).toContain('consultant');
      expect(result.matchedKeywords).toEqual(expect.arrayContaining(['senior', 'manager', 'consultant']));
    });

    test('should provide detailed analysis for an other role', () => {
      const role = 'Customer Support Representative';
      const result = detailedRoleAnalysis(role);
      expect(result.originalRole).toBe(role);
      expect(result.normalizedRole).toBe('customer support representative');
      expect(result.category).toBe('other');
      expect(result.score).toBe(0);
      expect(result.reasoning).toContain('other');
      expect(result.matchedKeywords).toEqual([]);
    });

    test('should handle empty role string', () => {
      const role = '';
      const result = detailedRoleAnalysis(role);
      expect(result.originalRole).toBe('');
      expect(result.normalizedRole).toBe('');
      expect(result.category).toBe('other');
      expect(result.score).toBe(0);
      expect(result.reasoning).toContain('other');
      expect(result.matchedKeywords).toEqual([]);
    });
  });
});
