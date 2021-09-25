const express = require('express');

const { Order, validate } = require('../models/order');

const router = express.Router();

router.get('/', async (req, res) => {
  const orders = await Order.find();
  console.log(orders);
  res.send(orders);
});

router.get('/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).send('The order with the ID was not found.');
  }

  return res.send(order);
});

router.post('/', async (req, res) => {
  req.body.items = JSON.parse(req.body.items);
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);
  if ((req.body.items.filter((e) => e.quantity !== '0').length === 0)) return res.status(400).send('You need at least one item');

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

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const order = await Order.findByIdAndUpdate(req.params.id, req.params.items, {
    new: true,
  });

  if (!order) {
    return res.status(404).send('The order with the ID was not found.');
  }

  return res.send(order);
});

router.delete('/:id', async (req, res) => {
  const order = await Order.findByIdAndRemove(req.params.id);

  if (!order) {
    return res.status(404).send('The order with the ID was not found.');
  }

  return res.send(order);
});

module.exports = router;
