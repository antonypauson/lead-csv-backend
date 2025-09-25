const express = require('express');
const helmet = require('helmet'); 
const cors = require('cors');
const config = require('./config'); // @description Configuration service for environment variables
const routes = require('./routes'); // @description Main API router

const app = express();

// MIDDLEWARES
app.use(helmet()); // @description using 'helmet' middleware for security headers
app.use(cors()); // @description Enables Cross-Origin Resource Sharing
app.use(express.json()); // @description Parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true })); // @description Parses incoming requests with URL-encoded payloads

// Mount API routes
app.use('/api', routes);

// PORT from config service
const PORT = config.port;


// Server Listening to PORT
app.listen(config.port, () => {
  console.log(`Server is running on port ${PORT} in ${config.env} mode`);
});

// export this
module.exports = app;
