const Joi = require('joi');
const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true,
    min: 5,
    max: 255,
    unique: true,
  },
  items: [
    {
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
    },
  ],
});

function validateOrder(order, mail) {
  const schema = Joi.object({
    owner: Joi.string().min(5).max(255).required()
      .email(),
    items: Joi.array().required().items({
      name: Joi.string().min(1).max(255).required(),
      price: Joi.number().min(1).max(1000).required(),
    }),
  });

  return schema.validate({ owner: mail, items: order });
}

exports.validate = validateOrder;

module.exports.Menu = mongoose.model('Menu', menuSchema);
