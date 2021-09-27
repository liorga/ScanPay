const router = require('express').Router();
const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');
const { User, registerValidation, loginValidation } = require('../models/user');

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

    const token = jwt.sign({ id: user._id }, config.get('jwtPrivateKey'));

    return res.cookie('auth-token', token).send(user.name);
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
