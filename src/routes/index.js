const express = require('express');

const router = express.Router();

/**
 * @route GET /
 * @description A simple route for testing the API base path.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {void} Sends a string message indicating the API is running.
 */
router.get('/', (req, res) => {
  res.send('Lead Qualification Backend API is running!');
});

module.exports = router;
