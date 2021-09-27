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

  const order = await Order.findOne({ orderName: req.params.name },
    { orderName: 1, items: 1, _id: 0 });
  if (!order) {
    return sendErrorPage(404, 'The order not found', res);
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

  req.body.items = JSON.parse(req.body.items);
  req.body.items = req.body.items.filter((e) => e.quantity !== '0');
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);
  if (req.body.items.filter((e) => e.quantity !== '0').length === 0) return res.status(400).send('You need at least one item');

  const order = await Order.updateOne({ orderName: req.body.orderName },
    { items: req.body.items }, { new: true });

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

  const orderIsPaid = await Order.findOne({ orderName: req.body.orderName }, { isPaid: 1 });
  if (!orderIsPaid) return res.status(404).send('Order not found');
  if (!orderIsPaid.isPaid) return res.status(409).send('Order not paid');

  const order = await Order.findOneAndRemove(req.body.orderName);
  return res.send(order);
});

router.post('/close', verify, async (req, res) => {
  const user = await User.findOne({
    _id: jwt.decode(req.cookies['auth-token']).id,
  });
  if (user.userType !== 'worker') return sendErrorPage(403, 'Forbidden User', res);

  const order = await Order.findOne({ orderName: req.body.orderName });
  if (!order) return res.status(404).send('Order not found');
  if (order.isPaid) return res.status(409).send('Order already paid');

  if (!global.ordersCheckout.find((e) => e.orderName === order.orderName)) {
    const items = [];

    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i += 1) {
        items.push({
          name: item.name, price: item.price, user: null, paid: false,
        });
      }
    });

    global.ordersCheckout.push({ _id: order._id, items });
  }

  return res.send(`http://${req.get('host')}/checkout/${order._id}`);
});

module.exports = router;
