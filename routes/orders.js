const express = require('express');

const { Order, validate } = require('../db_models/order');

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await Order.find();

  res.send(users);
});

router.get('/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).send('The order with the ID was not found.');
  }

  res.send(order);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let order = new Order({
    id: req.body.id,
    items: req.body.items,
  });
  order = await order.save();

  res.send(order);
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

  res.send(order);
});

router.delete('/:id', async (req, res) => {
  const order = await Order.findByIdAndRemove(req.params.id);

  if (!order) {
    return res.status(404).send('The order with the ID was not found.');
  }

  res.send(order);
});