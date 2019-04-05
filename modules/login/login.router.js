const express = require('express');

const app = express();

const { login } = require('./login.controller');

app.post('/login', login);

module.exports = app;