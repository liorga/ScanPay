
const path = require('path');
var express = require('express')
var bodyParser = require('body-parser')

var app = express()

// create application/json parser
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

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

router.post('/',urlencodedParser, async (req, res) => {
  // const { error } = validate(req.body);
  // if (error) return res.status(400).send(error.details[0].message);
   //var formData = JSON.stringify($("#myForm").serializeArray());
   console.log(req.body);
  // let order = new Order({
  //   id: req.body.id,
  //   items: req.body.items,
  // });
  // order = await order.save();

  // res.send(order);
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

module.exports = router;
