const express = require('express');
const users = require('../routes/users');
const orders = require('../routes/orders');

module.exports = function usersApi(app) {
  app.use(express.json());
  app.use('/api/users', users);
  app.use('/api/orders', orders);
};
