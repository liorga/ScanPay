const _ = require('lodash');

const express = require('express');

const { User, validate } = require('../db_models/user');

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await User.find();

  res.send(users);
});

router.get('/me', async (req, res) => {
  // eslint-disable-next-line no-underscore-dangle

  const user = await User.findById(req.user._id).select('-password');

  res.send(user);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });

  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['name', 'email', 'password']));

  await user.save();

  const token = user.generateAuthToken();

  res

    .header('x-auth-token', token)

    .send(_.pick(user, ['_id', 'name', 'email']));

  return null;
});

module.exports = router;
