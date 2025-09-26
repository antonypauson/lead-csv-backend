const { v4: uuidv4 } = require('uuid'); // generating unique IDs

/**
 * @typedef {object} Offer
 * @property {string} id - Unique identifier for the offer.
 * @property {string} name - The name of the offer.
 * @property {string[]} value_props - Array of value propositions.
 * @property {string[]} ideal_use_cases - Array of ideal use cases.
 */

/**
 * in-memory storage for offers
 * @type {Offer[]}
 */
const offers = [];

/**
 * Creates a new offer and stores it in memory.
 * @param {object} offerData - The data for the new offer (name, value_props, ideal_use_cases).
 * @returns {Offer} The created offer with a unique ID.
 */
function createOffer(offerData) {
  const newOffer = {
    id: uuidv4(),
    ...offerData,
  };
  offers.push(newOffer);
  return newOffer;
}

/**
 * Retrieves all stored offers.
 * @returns {Offer[]} An array of all offers.
 */
function getAllOffers() {
  return offers;
}

/**
 * Retrieves a specific offer by its ID.
 * @param {string} id - The unique identifier of the offer.
 * @returns {Offer|undefined} The offer object if found, undefined otherwise.
 */
function getOfferById(id) {
  return offers.find(offer => offer.id === id);
}

module.exports = {
  createOffer,
  getAllOffers,
  getOfferById,
};
