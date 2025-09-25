const { validateCsvHeaders } = require('../../../src/utils/csvValidation');

describe('csvValidation', () => {
  const expectedHeaders = ['name', 'role', 'company', 'industry', 'location', 'linkedin_bio'];

  test('should return isValid: true for valid headers (exact match)', () => {
    const parsedData = [{
      name: 'John Doe',
      role: 'CEO',
      company: 'ABC Inc',
      industry: 'Tech',
      location: 'NY',
      linkedin_bio: 'Bio here' 
    }]; //exact headers
    const result = validateCsvHeaders(parsedData, expectedHeaders);
    expect(result.isValid).toBe(true);
    expect(result.missingHeaders).toEqual([]);
  });

  test('should return isValid: true for valid headers (case-insensitive match)', () => {
    const parsedData = [{
      Name: 'John Doe',
      ROLE: 'CEO',
      company: 'ABC Inc',
      Industry: 'Tech',
      location: 'NY',
      LinkedIn_Bio: 'Bio here'
    }]; //different cased headers
    const result = validateCsvHeaders(parsedData, expectedHeaders);
    expect(result.isValid).toBe(true);
    expect(result.missingHeaders).toEqual([]);
  });

  test('should return isValid: false and list missing headers', () => {
    const parsedData = [{
      name: 'John Doe',
      role: 'CEO',
      company: 'ABC Inc',
      location: 'NY',
      linkedin_bio: 'Bio here'
    }]; // Missing 'industry'
    const result = validateCsvHeaders(parsedData, expectedHeaders);
    expect(result.isValid).toBe(false);
    expect(result.missingHeaders).toEqual(['industry']);
  });

  test('should return isValid: false and list multiple missing headers', () => {
    const parsedData = [{
      name: 'John Doe',
      company: 'ABC Inc',
      linkedin_bio: 'Bio here'
    }]; // Missing 'role', 'industry', 'location'
    const result = validateCsvHeaders(parsedData, expectedHeaders);
    expect(result.isValid).toBe(false);
    expect(result.missingHeaders).toEqual(['role', 'industry', 'location']);
  });

  test('should return isValid: false for empty parsed data', () => {
    const parsedData = [];
    const result = validateCsvHeaders(parsedData, expectedHeaders);
    expect(result.isValid).toBe(false);
    expect(result.missingHeaders).toEqual(expectedHeaders);
  });

  test('should return isValid: false for null parsed data', () => {
    const parsedData = null;
    const result = validateCsvHeaders(parsedData, expectedHeaders);
    expect(result.isValid).toBe(false);
    expect(result.missingHeaders).toEqual(expectedHeaders);
  });

  test('should handle extra headers in parsed data gracefully', () => {
    const parsedData = [{
      name: 'John Doe',
      role: 'CEO',
      company: 'ABC Inc',
      industry: 'Tech',
      location: 'NY',
      linkedin_bio: 'Bio here',
      extra_field: 'some data'
    }]; //Extra Field than headers
    const result = validateCsvHeaders(parsedData, expectedHeaders);
    expect(result.isValid).toBe(true);
    expect(result.missingHeaders).toEqual([]);
  });
});
