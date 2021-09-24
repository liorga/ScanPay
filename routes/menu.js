const express = require('express');
const jwt = require('jsonwebtoken');
const verify = require('./verifyToken');
const { Menu, validate } = require('../models/menu');
const { User } = require('../models/user');

const router = express.Router();

router.get('/', verify, async (req, res) => {
  const user = await User.findOne({ _id: jwt.decode(req.cookies['auth-token']).id });
  const menu = await Menu.findOne({ owner: user.email });
  res.send(menu ? menu.items : null);
});

router.post('/', verify, async (req, res) => {
  try {
    const data = JSON.parse(req.body.items);
    const user = await User.findOne({ _id: jwt.decode(req.cookies['auth-token']).id });
    if (user.userType !== 'manager') return res.status(403).send('Must be a manager');

    const { error } = validate(data, user.email);
    if (error) return res.status(400).send(error.details[0].message);

    let menu = new Menu({
      owner: user.email,
      items: data,
    });

    menu = await menu.save();
    return res.send(menu);
  } catch (err) {
    return res.status(400).send(err);
  }
});

// router.put('/:id', async (req, res) => {
//   const { error } = validate(req.body);
//   if (error) return res.status(400).send(error.details[0].message);

//   const menu = await Menu.findByIdAndUpdate(req.params.id, req.params.items, {
//     new: true,
//   });

//   if (!menu) {
//     return res.status(404).send('The menu with the ID was not found.');
//   }

//   return res.send(menu);
// });

router.delete('/', verify, async (req, res) => {
  const user = await User.findOne({ _id: jwt.decode(req.cookies['auth-token']).id });
  const menu = await Menu.findOneAndRemove({ owner: user.email });

  if (!menu) {
    return res.status(404).send('There is now such menu');
  }

  return res.send('Done');
});

module.exports = router;
