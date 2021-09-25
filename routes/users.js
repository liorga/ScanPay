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

router.get('/newOrder', verify, (req, res) => {
  res.sendFile(path.resolve('./public/pages/newOrder.html'));
});

router.get('/workers', verify, async (req, res) => {
  const user = await User.findOne({ _id: jwt.decode(req.cookies['auth-token']).id });
  if (user.userType !== 'manager') return res.status(403).send('Must be a manager');

  const workers = [];
  for (let i = 0; i < user.workers.length; i += 1) {
    workers.push(User.findOne({ _id: user.workers[i] }));
  }

  const result = [];
  (await Promise.all(workers)).forEach((w) => { result.push(w.email); });

  return res.send(result);
});

router.post('/worker', verify, async (req, res) => {
  const user = await User.findOne({ _id: jwt.decode(req.cookies['auth-token']).id });
  if (user.userType !== 'manager') return res.status(403).send('Must be a manager');

  const worker = await User.findOne({ email: req.body.email });
  if (!worker || worker.userType !== 'worker') return res.status(404).send('Worker not found');

  if (user.workers.indexOf(worker._id) === -1) {
    user.workers.push(worker._id);
    user.save();
    return res.send();
  }

  return res.status(409).send('Worker already exists');
});

router.delete('/worker', verify, async (req, res) => {
  const user = await User.findOne({ _id: jwt.decode(req.cookies['auth-token']).id });
  if (user.userType !== 'manager') return res.status(403).send('Must be a manager');

  const worker = await User.findOne({ email: req.body.email });
  if (!worker || worker.userType !== 'worker') return res.status(404).send('Worker not found');

  if (user.workers.indexOf(worker._id) !== -1) {
    user.workers.remove(worker._id);
    user.save();
    return res.send();
  }

  return res.status(404).send('Worker not exists');
});

module.exports = router;
