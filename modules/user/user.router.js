const express = require('express');
const app = express();

//MIDDLEWARES
const authorizationMiddleware = require('../../middlewares/authorization.middlewares');

const { create, list, update, logicalDelete } = require('./user.controller');

app.post('/user', [authorizationMiddleware.authorization, authorizationMiddleware.isAdmin], create);

app.get('/user', [authorizationMiddleware.authorization, authorizationMiddleware.isAdmin], list);

app.put('/user/:id', [authorizationMiddleware.authorization, authorizationMiddleware.isAdmin], update);

app.delete('/user/:id', [authorizationMiddleware.authorization, authorizationMiddleware.isAdmin], logicalDelete);

module.exports = app;