const { validateOffer } = require('../../../src/utils/validation');

describe('Offer Validation Utility', () => {
  test('should return null for a offer with proper fields', () => {
    const validOffer = {
      name: 'Valid Offer',
      value_props: ['Prop A', 'Prop B'],
      ideal_use_cases: ['Case X', 'Case Y'],
    };
    expect(validateOffer(validOffer)).toBeNull();
  });

  //name test
  test('should return an error message if name is missing entirely', () => {
    const invalidOffer = {
      value_props: ['Prop A'],
      ideal_use_cases: ['Case X'],
    };
    expect(validateOffer(invalidOffer)).toBe('Offer name is required and must be a non-empty string.');
  });

  test('should return an error message if name is an empty string but is there', () => {
    const invalidOffer = {
      name: '   ', //empty
      value_props: ['Prop A'],
      ideal_use_cases: ['Case X'],
    };
    expect(validateOffer(invalidOffer)).toBe('Offer name is required and must be a non-empty string.');
  });

  //value_props test
  test('should return an error message if value_props is missing entirely', () => {
    const invalidOffer = {
      name: 'Valid Name',
      ideal_use_cases: ['Case X'],
    };
    expect(validateOffer(invalidOffer)).toBe('Offer value propositions are required and must be a non-empty array of strings.');
  });

  test('should return an error message if value_props is an empty array', () => {
    const invalidOffer = {
      name: 'Valid Name',
      value_props: [],
      ideal_use_cases: ['Case X'],
    };
    expect(validateOffer(invalidOffer)).toBe('Offer value propositions are required and must be a non-empty array of strings.');
  });

  test('should return an error message if value_props contains non-string or empty string', () => {
    const invalidOffer = {
      name: 'Valid Name',
      value_props: ['Prop A', ' '],
      ideal_use_cases: ['Case X'],
    };
    expect(validateOffer(invalidOffer)).toBe('All offer value propositions must be non-empty strings.');
  });

  //ideal_use_cases test
  test('should return an error message if ideal_use_cases is missing', () => {
    const invalidOffer = {
      name: 'Valid Name',
      value_props: ['Prop A'],
    };
    expect(validateOffer(invalidOffer)).toBe('Offer ideal use cases are required and must be a non-empty array of strings.');
  });

  test('should return an error message if ideal_use_cases is an empty array', () => {
    const invalidOffer = {
      name: 'Valid Name',
      value_props: ['Prop A'],
      ideal_use_cases: [],
    };
    expect(validateOffer(invalidOffer)).toBe('Offer ideal use cases are required and must be a non-empty array of strings.');
  });

  test('should return an error message if ideal_use_cases contains non-string or empty string', () => {
    const invalidOffer = {
      name: 'Valid Name',
      value_props: ['Prop A'],
      ideal_use_cases: ['Case X', ''],
    };
    expect(validateOffer(invalidOffer)).toBe('All offer ideal use cases must be non-empty strings.');
  });
});
