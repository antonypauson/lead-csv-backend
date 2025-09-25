const offerService = require('../services/offer.service');
const { validateOffer } = require('../utils/validation');

/**
 * @function createOffer
 * @description Handles the creation of a new offer.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void} Sends a JSON response with the created offer (201) or an error message (400, 500).
 */
function createOffer(req, res) {
  try {
    const validationErrors = validateOffer(req.body); // Renamed for clarity

    if (validationErrors.length > 0) { // Check if there are any errors
      return res.status(400).json({
        success: false,
        error: 'Invalid offer data',
        details: validationErrors, // Pass the array of errors
      });
    }

    const { name, value_props, ideal_use_cases } = req.body;
    const newOffer = offerService.createOffer({ name, value_props, ideal_use_cases });

    res.status(201).json({
      success: true,
      offer_id: newOffer.id,
      message: 'Offer created successfully',
      data: newOffer,
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
}

/**
 * @function getAllOffers
 * @description Handles the retrieval of all offers.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void} Sends a JSON response with an array of all offers (200) or an error message (500).
 */
function getAllOffers(req, res) {
  try {
    const offers = offerService.getAllOffers();
    res.status(200).json(offers);
  } catch (error) {
    console.error('Error retrieving offers:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

module.exports = {
  createOffer,
  getAllOffers,
};
