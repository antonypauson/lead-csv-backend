/**
 * @function validateCsvHeaders
 * @description Validates if the headers of the parsed CSV match expected headers.
 * Returns an object indicating validity and a list of missing headers if any.
 * @param {Array<object>} parsedData - An array of objects representing the parsed CSV data.
 * @param {Array<string>} expectedHeaders - An array of strings representing the required headers.
 * @returns {{isValid: boolean, missingHeaders: Array<string>}} An object with validity status (will be true if valid) and missing headers (will be empty array).
 */
const validateCsvHeaders = (parsedData, expectedHeaders) => {
  if (!parsedData || parsedData.length === 0) {
    return { isValid: false, missingHeaders: expectedHeaders };
  }

  const actualHeadersLower = Object.keys(parsedData[0]).map(header => header.toLowerCase());
  const expectedHeadersLower = expectedHeaders.map(header => header.toLowerCase());

  const missingHeaders = expectedHeaders.filter(
    (expectedHeader, index) => !actualHeadersLower.includes(expectedHeadersLower[index])
  );

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders: missingHeaders, 
  };
};

module.exports = {
  validateCsvHeaders,
};
