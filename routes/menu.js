const express = require('express');

const { Menu } = require('../models/menu');

const router = express.Router();

router.get('/', async (req, res) => {
  const menu = await Menu.find();
  res.send(menu);
});

router.post('/', async (req, res) => {
  // const { error } = validate(req.body);
  // if (error) return res.status(400).send(error.details[0].message);
  console.log(req.body);
  const names = req.body.name;
  const prices = req.body.price;
  const mapArrays = (names, prices) => {
    const res = [];
    for (let i = 0; i < names.length; i++) {
      res.push({
        name: names[i],
        price: prices[i],
      });
    }
    return res;
  };
  console.log(mapArrays(names, prices));
  let menu = new Menu({
    items: mapArrays(names, prices),
  });
  menu = await menu.save();

  res.send(menu);
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

router.delete('/:id', async (req, res) => {
  const menu = await Menu.findByIdAndRemove(req.params.id);

  if (!menu) {
    return res.status(404).send('The order with the ID was not found.');
  }

  return res.send(menu);
});

module.exports = router;
