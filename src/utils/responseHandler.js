/**
 * @function sendSuccessResponse
 * @description Sends a standardized success response.
 * @param {object} res - Express response object.
 * @param {number} statusCode - HTTP status code (e.g., 200, 201).
 * @param {object|string} data - The data to send in the response body.
 * @param {string} [message='Operation successful'] - A descriptive success message.
 * @returns {void}
 */
const sendSuccessResponse = (res, statusCode, data, message = 'Operation successful') => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * @function sendErrorResponse
 * @description Sends a standardized error response.
 * @param {object} res - Express response object.
 * @param {number} statusCode - HTTP status code (e.g., 400, 401, 500).
 * @param {string} message - A descriptive error message.
 * @param {object} [details={}] - Optional additional error details.
 * @returns {void}
 */
const sendErrorResponse = (res, statusCode, message, details = {}) => {
  res.status(statusCode).json({
    success: false,
    message,
    details,
  });
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
};
