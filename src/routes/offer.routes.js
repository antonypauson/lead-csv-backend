const express = require('express');
const offerController = require('../controllers/offer.controller');

const router = express.Router();

/**
 * @route POST /
 * @description Creates a new offer.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void} Sends a JSON response with the created offer (201) or an error message (400, 500).
 */
router.post('/', offerController.createOffer);

/**
 * @route GET /
 * @description Retrieves all offers.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void} Sends a JSON response with an array of all offers (200) or an error message (500).
 */
router.get('/', offerController.getAllOffers);

module.exports = router;
