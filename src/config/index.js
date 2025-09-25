// environment variables from .env file
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  openaiApiKey: process.env.OPENAI_API_KEY,
};

// make sure the openai api key exists
if (!config.openaiApiKey) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables.');
}

module.exports = config;
