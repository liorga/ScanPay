const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function auth(req, res, next) {
  const token = req.cookies['auth-token'];
  if (!token) return res.status(401).send('Access Denied.'); // .redirect('/');

  try {
    const verified = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
  return null;
};
