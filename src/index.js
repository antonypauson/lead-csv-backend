const express = require('express');
const helmet = require('helmet'); 
const cors = require('cors');
const config = require('./config'); // configuration service

// express
const app = express();

// MIDDLEWARES
app.use(helmet()); // using 'helmet' middleware for HTTPS
app.use(cors()); // cors
app.use(express.json()); // json handling requests
app.use(express.urlencoded({ extended: true })); //urlencoded data parsing

// PORT from config service
const PORT = config.port;

// testing purposes
app.get('/', (req, res) => {
  res.send('Lead Qualification Backend is running!');
});

// Server Listening to PORT
app.listen(config.port, () => {
  console.log(`Server is running on port ${PORT} in ${config.env} mode`);
});

// export this
module.exports = app;
