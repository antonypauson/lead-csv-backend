const fs = require('fs');
const csv = require('csv-parser');

/**
 * @function parseCsv
 * @description Parses a CSV file from the given file path into an array of JavaScript objects.
 * @param {string} filePath - The path to the CSV file.
 * @returns {Promise<Array<object>>} A promise that resolves with an array of parsed CSV rows.
 * @throws {Error} If there is an error reading or parsing the CSV file.
 */
const parseCsv = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = fs.createReadStream(filePath);

    stream.on('error', (error) => {
      reject(new Error(`Failed to parse CSV file: ${error.message}`));
      stream.destroy(); // Ensure the stream is closed
    });

    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => { // This catches errors from csv-parser itself
        reject(new Error(`Failed to parse CSV data: ${error.message}`));
      });
  });
};

module.exports = {
  parseCsv,
};
