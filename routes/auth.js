const router = require('express').Router();
const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');
const { User, registerValidation, loginValidation } = require('../models/user');
const sendErrorPage = require('../services/utils');
const verify = require('./verifyToken');

router.post('/register', async (req, res) => {
  const conf = req.body.cpassword;
  delete req.body.cpassword;

  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.body.password !== conf) return res.status(400).send("passwords don't match");

  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send('Email already exists');

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    userType: req.body.userType,
  });

  try {
    await user.save();
    return res.send();
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send('Email or password is incorrect' /* error.details[0].message */);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).send('Email or password is incorrect');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(401).send('Email or password is incorrect');

    const online = global.onlineUsers.find((e) => e === user._id.toString());
    if (online) return res.status(401).send('User already online');
    global.onlineUsers.push(user._id.toString());

    const token = jwt.sign({ id: user._id }, config.get('jwtPrivateKey'));
    return res.cookie('auth-token', token).send(user.name);
  } catch (err) {
    return sendErrorPage(500, err.message, res);
  }
});

router.post('/logout', verify, async (req, res) => {
  const user = await User.findOne({ _id: jwt.decode(req.cookies['auth-token']).id });
  if (!user) return sendErrorPage(404, 'Not found', res);

  const onlineIndex = global.onlineUsers.findIndex((e) => e === user._id.toString());
  console.log(global.onlineUsers);
  if (onlineIndex === -1) return res.status(404).send('Not found');
  global.onlineUsers.splice(onlineIndex, 1);
  return res.send('ok');
});

module.exports = router;
