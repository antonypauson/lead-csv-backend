/**
 * Validates the data for creating a new offer.
 * @param {object} offerData - The data for the new offer.
 * @param {string} offerData.name - The name of the offer.
 * @param {string[]} offerData.value_props - Array of value propositions.
 * @param {string[]} offerData.ideal_use_cases - Array of ideal use cases.
 * @returns {string[]} An array of error messages if validation fails, an empty array if validation succeeds.
 */
function validateOffer(offerData) {
  const errors = [];
  const { name, value_props, ideal_use_cases } = offerData;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Offer name is required and must be a non-empty string.');
  }

  //validating value_props whole
  if (!value_props || !Array.isArray(value_props) || value_props.length === 0) {
    errors.push('Offer value propositions are required and must be a non-empty array of strings.');
  } else if (value_props.some(prop => typeof prop !== 'string' || prop.trim().length === 0)) {
    //validating value_props each
    errors.push('All offer value propositions must be non-empty strings.');
  }

  //validating ideal_use_cases whole
  if (!ideal_use_cases || !Array.isArray(ideal_use_cases) || ideal_use_cases.length === 0) {
    errors.push('Offer ideal use cases are required and must be a non-empty array of strings.');
  } else if (ideal_use_cases.some(useCase => typeof useCase !== 'string' || useCase.trim().length === 0)) {
    //validating ideal_use_cases each
    errors.push('All offer ideal use cases must be non-empty strings.');
  }

  return errors;
}

module.exports = {
  validateOffer,
};
