const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const { User } = require('../models/user');
const { Order } = require('../models/order');
const sendErrorPage = require('../services/utils');

const router = express.Router();
const verify = require('./verifyToken');

router.get('/', verify, async (req, res) => {
  const user = await User.findOne({ _id: jwt.decode(req.cookies['auth-token']).id });
  if (!user) return sendErrorPage(404, 'not found', res);

  switch (user.userType) {
    case 'client':
      return res.sendFile(path.resolve('./public/pages/clientProfile.html'));
    case 'worker':
      return res.sendFile(path.resolve('./public/pages/workerProfile.html'));
    case 'manager':
      return res.sendFile(path.resolve('./public/pages/managerProfile.html'));
    default:
      return sendErrorPage(404, 'Not Found', res);
  }
});

router.get('/newOrder', verify, async (req, res) => {
  const user = await User.findOne({ _id: jwt.decode(req.cookies['auth-token']).id });
  if (!user) return sendErrorPage(404, 'Not found', res);
  if (user.userType !== 'worker') return sendErrorPage(403, 'Must be a worker', res);

  return res.sendFile(path.resolve('./public/pages/newOrder.html'));
});

router.get('/editOrder/:name', verify, async (req, res) => {
  const user = await User.findOne({ _id: jwt.decode(req.cookies['auth-token']).id });
  if (!user) return sendErrorPage(404, 'Not found', res);
  if (user.userType !== 'worker') return sendErrorPage(403, 'Must be a worker', res);

  const order = await Order.findOne({ orderName: req.params.name });
  if (!order) return sendErrorPage(404, 'Order not found', res);

  return res.sendFile(path.resolve('./public/pages/editOrder.html'));
});

router.get('/workers', verify, async (req, res) => {
  const user = await User.findOne({ _id: jwt.decode(req.cookies['auth-token']).id });
  if (!user) return sendErrorPage(404, 'Not found', res);
  if (user.userType !== 'manager') return sendErrorPage(403, 'Must be a manager', res);

  const workers = [];
  for (let i = 0; i < user.workers.length; i += 1) {
    workers.push(User.findOne({ _id: user.workers[i] }));
  }

  const result = [];
  (await Promise.all(workers)).forEach((w) => { result.push(w); });

  const resultEmails = [];
  result.forEach((w) => { resultEmails.push(w.email); });

  return res.send(resultEmails);
});

router.post('/worker', verify, async (req, res) => {
  const user = await User.findOne({ _id: jwt.decode(req.cookies['auth-token']).id });
  if (!user) return sendErrorPage(404, 'Not found', res);
  if (user.userType !== 'manager') return sendErrorPage(403, 'Must be a manager', res);

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
  if (!user) return sendErrorPage(404, 'Not found', res);
  if (user.userType !== 'manager') return sendErrorPage(403, 'Must be a manager', res);

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
