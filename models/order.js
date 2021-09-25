const Joi = require('joi');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
    unique: true,
  },

  items: [{
    name: {
      type: String,
      required: true,
      minlength: 1,
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
  }],

  isPaid: {
    type: Boolean,
    default: false,
  },
});

function validateOrder(order) {
  const schema = Joi.object({
    orderName: Joi.string().min(1).max(255).required(),
    items: Joi.array()
      .required()
      .items({
        name: Joi.string().min(1).max(255).required(),
        price: Joi.number().min(0).max(1000).required(),
        quantity: Joi.number().min(0).max(100).required(),
      }),
  });

  return schema.validate(order);
}

exports.validate = validateOrder;

module.exports.Order = mongoose.model('Order', orderSchema);
