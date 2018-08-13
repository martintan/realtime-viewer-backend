const express = require('express');
const app = express();
const morgan = require('morgan');

app.use(morgan('dev'));
app.use('/documents', express.static('documents'));

module.exports = app;
