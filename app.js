const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const routes = require('./routes/api');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const conn = mongoose.connection;

app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});  