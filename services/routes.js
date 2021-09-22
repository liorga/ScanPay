const express = require('express');
const users = require('../routes/users');

module.exports = function usersApi(app) {
  app.use(express.json());
  app.use('/api/users', users);
};
