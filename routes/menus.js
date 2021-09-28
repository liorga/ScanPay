const express = require('express');
const jwt = require('jsonwebtoken');
const verify = require('./verifyToken');
const { Menu, validate } = require('../models/menu');
const { User } = require('../models/user');
const sendErrorPage = require('../services/utils');

const router = express.Router();

router.get('/', verify, async (req, res) => {
  const user = await User.findOne({
    _id: jwt.decode(req.cookies['auth-token']).id,
  });
  if (user.userType === 'manager') {
    const menu = await Menu.findOne({ owner: user.email });
    res.send(menu ? menu.items : null);
  }
  if (user.userType === 'worker') {
    const boss = await User.findOne({ workers: user._id });
    if (boss) {
      const menu = await Menu.findOne({ owner: boss.email });
      res.send(menu ? menu.items : null);
    } else {
      res.send(null);
    }
  }
});

router.post('/', verify, async (req, res) => {
  try {
    const data = JSON.parse(req.body.items);
    const user = await User.findOne({
      _id: jwt.decode(req.cookies['auth-token']).id,
    });

    if (!user) return sendErrorPage(404, 'Not found', res);
    if (user.userType !== 'manager') return res.status(403).send('Must be a manager');

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
      return res
        .status(409)
        .send('menu already exist cant post need to update');
    }
    menu = await menu.save();
    return res.send(menu);
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.put('/', verify, async (req, res) => {
  try {
    const data = JSON.parse(req.body.items);
    const user = await User.findOne({
      _id: jwt.decode(req.cookies['auth-token']).id,
    });
    if (!user) return sendErrorPage(404, 'Not found', res);
    if (user.userType !== 'manager') return res.status(403).send('Must be a manager');

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
    return res.status(400).send(err);
  }
});

router.delete('/', verify, async (req, res) => {
  const user = await User.findOne({
    _id: jwt.decode(req.cookies['auth-token']).id,
  });
  if (!user) return sendErrorPage(404, 'Not found', res);
  const menu = await Menu.findOneAndRemove({ owner: user.email });

  if (!menu) {
    return res.status(404).send('There is now such menu');
  }

  return res.send('Done');
});

module.exports = router;
