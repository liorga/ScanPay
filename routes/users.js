const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const { User } = require('../models/user');
const sendErrorPage = require('../services/utils');

const router = express.Router();
const verify = require('./verifyToken');

router.get('/', verify, async (req, res) => {
  const user = await User.findOne({ _id: jwt.decode(req.cookies['auth-token']).id });

  switch (user.userType) {
    case 'client':
      res.sendFile(path.resolve('./public/pages/clientProfile.html'));
      break;
    case 'worker':
      res.sendFile(path.resolve('./public/pages/workerProfile.html'));
      break;
    case 'manager':
      res.sendFile(path.resolve('./public/pages/managerProfile.html'));
      break;
    default:
      sendErrorPage(404, 'Not Found', res);
  }
});

module.exports = router;
