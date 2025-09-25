// imports
const express = require('express');
const helmet = require('helmet'); 
const cors = require('cors');
require('dotenv').config();

// express
const app = express();

// MIDDLEWARES
app.use(helmet()); // using 'helmet' middleware for HTTPS
app.use(cors()); // cors
app.use(express.json()); // json handling requests
app.use(express.urlencoded({ extended: true })); //urlencoded data parsing

// PORT 
const PORT = process.env.PORT || 3000;

// testing purposes
app.get('/', (req, res) => {
  res.send('Lead Qualification Backend is running!');
});

// Server Listening to PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// export this app
module.exports = app;
