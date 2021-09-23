// const Joi = require('joi');
const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
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

// function validateOrder(order) {
//   const schema = {
//     id: Joi.number().min(0).max(255).required(),
//   };

//   return Joi.validate(order, schema);
// }

// exports.validate = validateOrder;

module.exports.Menu = mongoose.model('Menu', menuSchema);
