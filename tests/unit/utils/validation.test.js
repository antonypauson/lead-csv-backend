const { validateOffer } = require('../../../src/utils/validation');

describe('Offer Validation Utility', () => {
  test('should return an empty array for a valid offer', () => {
    const validOffer = {
      name: 'Valid Offer',
      value_props: ['Prop A', 'Prop B'],
      ideal_use_cases: ['Case X', 'Case Y'],
    };
    expect(validateOffer(validOffer)).toEqual([]);
  });

  test('should return an array of error messages for invalid offer data', () => {
    const invalidOffer = {
      name: '   ', // Empty name
      value_props: ['Prop A', ' '], // Empty string in array
      // ideal_use_cases is missing
    };
    const errors = validateOffer(invalidOffer);
    expect(errors).toEqual([
      'Offer name is required and must be a non-empty string.',
      'All offer value propositions must be non-empty strings.',
      'Offer ideal use cases are required and must be a non-empty array of strings.',
    ]);
  });

  test('should return an error message if name is missing', () => {
    const invalidOffer = {
      value_props: ['Prop A'],
      ideal_use_cases: ['Case X'],
    };
    expect(validateOffer(invalidOffer)).toEqual(['Offer name is required and must be a non-empty string.']);
  });

  test('should return an error message if name is an empty string', () => {
    const invalidOffer = {
      name: '   ',
      value_props: ['Prop A'],
      ideal_use_cases: ['Case X'],
    };
    expect(validateOffer(invalidOffer)).toEqual(['Offer name is required and must be a non-empty string.']);
  });

  test('should return an error message if value_props is missing', () => {
    const invalidOffer = {
      name: 'Valid Name',
      ideal_use_cases: ['Case X'],
    };
    expect(validateOffer(invalidOffer)).toEqual(['Offer value propositions are required and must be a non-empty array of strings.']);
  });

  test('should return an error message if value_props is an empty array', () => {
    const invalidOffer = {
      name: 'Valid Name',
      value_props: [],
      ideal_use_cases: ['Case X'],
    };
    expect(validateOffer(invalidOffer)).toEqual(['Offer value propositions are required and must be a non-empty array of strings.']);
  });

  test('should return an error message if value_props contains non-string or empty string', () => {
    const invalidOffer = {
      name: 'Valid Name',
      value_props: ['Prop A', ' '],
      ideal_use_cases: ['Case X'],
    };
    expect(validateOffer(invalidOffer)).toEqual(['All offer value propositions must be non-empty strings.']);
  });

  test('should return an error message if ideal_use_cases is missing', () => {
    const invalidOffer = {
      name: 'Valid Name',
      value_props: ['Prop A'],
    };
    expect(validateOffer(invalidOffer)).toEqual(['Offer ideal use cases are required and must be a non-empty array of strings.']);
  });

  test('should return an error message if ideal_use_cases is an empty array', () => {
    const invalidOffer = {
      name: 'Valid Name',
      value_props: ['Prop A'],
      ideal_use_cases: [],
    };
    expect(validateOffer(invalidOffer)).toEqual(['Offer ideal use cases are required and must be a non-empty array of strings.']);
  });

  test('should return an error message if ideal_use_cases contains non-string or empty string', () => {
    const invalidOffer = {
      name: 'Valid Name',
      value_props: ['Prop A'],
      ideal_use_cases: ['Case X', ''],
    };
    expect(validateOffer(invalidOffer)).toEqual(['All offer ideal use cases must be non-empty strings.']);
  });
});
