// environment variables from .env file
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  groqApiKey: process.env.GROQ_API_KEY,
};

// make sure the groq api key exists
if (!config.groqApiKey) {
  throw new Error('GROQ_API_KEY is not defined in environment variables.');
}

module.exports = config;
