const Joi = require('joi');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: {
    type: Number,

    required: true,

    min: 0,

    max: 255,
  },
  items: [
    {
      name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
        max: 1000,
      },
      quantity: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
  ],
});

const Order = mongoose.model('Order', orderSchema);

exports.Order = Order;
