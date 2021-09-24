const express = require('express');
const jwt = require('jsonwebtoken');
const verify = require('./verifyToken');
const { Menu, validate } = require('../models/menu');
const { User } = require('../models/user');

const router = express.Router();

router.get('/', verify, async (req, res) => {
  const user = await User.findOne({
    _id: jwt.decode(req.cookies['auth-token']).id,
  });
  const menu = await Menu.findOne({ owner: user.email });
  res.send(menu ? menu.items : null);
});

router.post('/', verify, async (req, res) => {
  try {
    const data = JSON.parse(req.body.items);
    const user = await User.findOne({
      _id: jwt.decode(req.cookies['auth-token']).id,
    });
    if (user.userType !== 'manager') {
      return res.status(403).send('Must be a manager');
    }
    const { error } = validate(data, user.email);
    if (error) return res.status(400).send(error.details[0].message);

    let menu = new Menu({
      owner: user.email,
      items: data,
    });

    const menuExist = await Menu.findOne({
      owner: user.email,
    });
    if (menuExist) {
      //console.log(menuExist);
      return res
        .status(409)
        .send('menu alrady exsits cant post need to update');
    }
    menu = await menu.save();
    return res.send(menu);
  } catch (err) {
    console.log(err.message);
    return res.status(400).send(err);
  }
});

router.put('/', verify, async (req, res) => {
  try {
    const data = JSON.parse(req.body.items);
    const user = await User.findOne({
      _id: jwt.decode(req.cookies['auth-token']).id,
    });
    if (user.userType !== 'manager') {
      return res.status(403).send('Must be a manager');
    }
    const { error } = validate(data, user.email);
    if (error) return res.status(400).send(error.details[0].message);

    const menu = await Menu.updateOne(
      { owner: user.email },
      { items: data },
      {
        new: true,
      },
    );
    return res.send(menu);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

router.delete('/', verify, async (req, res) => {
  const user = await User.findOne({
    _id: jwt.decode(req.cookies['auth-token']).id,
  });
  const menu = await Menu.findOneAndRemove({ owner: user.email });

  if (!menu) {
    return res.status(404).send('There is now such menu');
  }

  return res.send('Done');
});

module.exports = router;
