const jwt = require('jsonwebtoken');
const config = require('config');
const sendErrorPage = require('../services/utils');

module.exports = function auth(req, res, next) {
  const token = req.cookies['auth-token'];
  if (!token) return sendErrorPage(401, 'Access Denied.', res);

  try {
    const verified = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
  return null;
};
