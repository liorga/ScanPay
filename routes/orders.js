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

  if (user.userType !== 'worker') return sendErrorPage(403, 'Forbidden User', res);

  const orders = await Order.find({}, { orderName: 1 });

  return res.send(orders);
});

router.get('/:name', verify, async (req, res) => {
  const user = await User.findOne({
    _id: jwt.decode(req.cookies['auth-token']).id,
  });

  if (user.userType !== 'worker') return sendErrorPage(403, 'Forbidden User', res);

  const order = await Order.findOne({ orderName: req.params.name });
  console.log(order);
  if (!order) {
    return res.status(404).send('The order with the ID was not found.');
  }

  return res.send(order);
});

router.post('/', verify, async (req, res) => {
  const user = await User.findOne({
    _id: jwt.decode(req.cookies['auth-token']).id,
  });

  if (user.userType !== 'worker') return sendErrorPage(403, 'Forbidden User', res);

  req.body.items = JSON.parse(req.body.items);
  req.body.items = req.body.items.filter((e) => e.quantity !== '0');
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);
  if (req.body.items.filter((e) => e.quantity !== '0').length === 0) return res.status(400).send('You need at least one item');

  let order = new Order({
    orderName: req.body.orderName,
    items: req.body.items,
    isPaid: false,
  });

  try {
    order = await order.save();
    return res.send(order);
  } catch (err) {
    return res.status(409).send('order name already exists');
  }
});

router.put('/', verify, async (req, res) => {
  const user = await User.findOne({
    _id: jwt.decode(req.cookies['auth-token']).id,
  });

  if (user.userType !== 'worker') return sendErrorPage(403, 'Forbidden User', res);

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

router.delete('/', verify, async (req, res) => {
  const user = await User.findOne({
    _id: jwt.decode(req.cookies['auth-token']).id,
  });

  if (user.userType !== 'worker') return sendErrorPage(403, 'Forbidden User', res);
  const order = await Order.findOneAndRemove(req.body.orderName);

  if (!order) {
    return res.status(404).send('The order with the name was not found.');
  }

  return res.send(order);
});

module.exports = router;
