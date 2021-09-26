const express = require('express');
const config = require('config');
const path = require('path');
const cookieParser = require('cookie-parser');
const { urlencoded } = require('body-parser');

const app = express();
require('./services/db')();

const port = process.env.PORT || config.get('port');
const io = require('socket.io')(app.listen(port, () => console.log(`Listening on port ${port}...`)));
const { Order } = require('./models/order');

global.ordersCheckout = [];

io.on('connection', (socket) => {
  socket.on('get-data', (id) => {
    const order = global.ordersCheckout.find((e) => e._id.toString() === id);
    socket.join(id);
    socket.emit('data', order.items);
  });

  socket.on('update', (oid, idx, uid, selected) => {
    const orderIndex = global.ordersCheckout.findIndex((e) => e._id.toString() === oid);
    global.ordersCheckout[orderIndex].items[idx].user = selected ? uid : null;

    socket.broadcast.to(oid).emit('user-update', idx);
  });

  socket.on('payment', async (oid, idxs) => {
    const orderIndex = global.ordersCheckout.findIndex((e) => e._id.toString() === oid);

    idxs.forEach((i) => {
      global.ordersCheckout[orderIndex].items[i].paid = true;
    });

    if (global.ordersCheckout[orderIndex].items.find((e) => !e.paid) === undefined) {
      await Order.updateOne({ _id: global.ordersCheckout[orderIndex]._id },
        { isPaid: true }, { new: true });

      global.ordersCheckout.splice(orderIndex, 1);
    }
  });
});

const authRoute = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const usersRoute = require('./routes/users');
const menusRoute = require('./routes/menus');
const sendErrorPage = require('./services/utils');
// const verify = require('./routes/verifyToken');

app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use('/api/user', authRoute);
app.use('/api/order', ordersRoutes);
app.use('/api/menu', menusRoute);
app.use('/api/user', usersRoute);
app.use('/profile', usersRoute);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  if (req.cookies['auth-token']) {
    res.redirect('profile');
  } else {
    res.sendFile(path.resolve('./public/pages/index.html'));
  }
});

app.get('/checkout/:id', (req, res) => {
  const order = global.ordersCheckout.find((e) => e._id.toString() === req.params.id);
  if (!order) sendErrorPage(404, 'Not Found', res);

  res.sendFile(path.resolve('./public/pages/checkout.html'));
});

// const port = process.env.PORT || config.get('port');
// app.listen(port, () => console.log(`Listening on port ${port}...`));
