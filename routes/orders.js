const express = require('express');
const jwt = require('jsonwebtoken');

const { User } = require('../models/user');
const { Order, validate } = require('../models/order');
const sendErrorPage = require('../services/utils');

const router = express.Router();
const verify = require('./verifyToken');

router.get('/', verify, async (req, res) => {
  const user = await User.findOne({
    _id: jwt.decode(req.cookies['auth-token']).id,
  });

  if (user.userType !== 'worker') return sendErrorPage(403, 'Forbbiden User', res);

  const orders = await Order.find();

  return res.send(orders);
});

router.get('/:name', verify, async (req, res) => {
  const user = await User.findOne({
    _id: jwt.decode(req.cookies['auth-token']).id,
  });

  if (user.userType !== 'worker') return sendErrorPage(403, 'Forbbiden User', res);

  const order = await Order.findById(req.params.name);

  if (!order) {
    return res.status(404).send('The order with the ID was not found.');
  }

  return res.send(order);
});

router.post('/', verify, async (req, res) => {
  const user = await User.findOne({
    _id: jwt.decode(req.cookies['auth-token']).id,
  });

  if (user.userType !== 'worker') return sendErrorPage(403, 'Forbbiden User', res);

  const data = JSON.parse(req.body.items);
  const { error } = validate(data);

  if (error) return res.status(400).send(error.details[0].message);

  let order = new Order({
    items: data,
    isPaid: false,
  });
  order = await order.save();

  return res.send(order);
});

router.put('/', verify, async (req, res) => {
  const user = await User.findOne({
    _id: jwt.decode(req.cookies['auth-token']).id,
  });

  if (user.userType !== 'worker') return sendErrorPage(403, 'Forbbiden User', res);

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const order = await Order.updateOne(req.params.name, req.params.items, {
    new: true,
  });

  if (!order) {
    return res.status(404).send('The order with the ID was not found.');
  }

  return res.send(order);
});

router.delete('/:name', verify, async (req, res) => {
  const user = await User.findOne({
    _id: jwt.decode(req.cookies['auth-token']).id,
  });

  if (user.userType !== 'worker') return sendErrorPage(403, 'Forbbiden User', res);
  const order = await Order.findOneAndRemove(req.params.name);

  if (!order) {
    return res.status(404).send('The order with the ID was not found.');
  }

  return res.send(order);
});

module.exports = router;
