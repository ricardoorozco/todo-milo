const express = require('express');
const app = express();

//MIDDLEWARES
const authorizationMiddleware = require('../../middlewares/authorization.middlewares');

const { create, list, view, update, logicalDelete } = require('./task.controller');

app.post('/task', [authorizationMiddleware.authorization, authorizationMiddleware.isAdmin], create);

app.get('/task', [authorizationMiddleware.authorization, authorizationMiddleware.isAdmin], list);

app.get('/task/:id', [authorizationMiddleware.authorization, authorizationMiddleware.isAdmin], view);

app.put('/task/:id', [authorizationMiddleware.authorization, authorizationMiddleware.isAdmin], update);

app.delete('/task/:id', [authorizationMiddleware.authorization, authorizationMiddleware.isAdmin], logicalDelete);

module.exports = app;