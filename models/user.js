const Joi = require('joi');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 2,
    max: 50,
  },
  email: {
    type: String,
    required: true,
    min: 5,
    max: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 5,
    max: 1024,
  },
  userType: {
    type: String,
    enum: ['client', 'worker', 'manager'],
    default: 'client',
  },
  workers: {
    type: [String],
  },
  isAdmin: Boolean,
});

function registerValidation(user) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(255).required()
      .email(),
    password: Joi.string().min(5).max(255).required(),
    userType: Joi.string(),
  });

  return schema.validate(user);
}

function loginValidation(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required()
      .email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(user);
}

module.exports.User = mongoose.model('User', UserSchema);
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
