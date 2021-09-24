const express = require('express');
const config = require('config');
const path = require('path');
const cookieParser = require('cookie-parser');
const { urlencoded } = require('body-parser');

const app = express();
require('./services/db')();

const port = process.env.PORT || config.get('port');
const io = require('socket.io')(app.listen(port, () => console.log(`Listening on port ${port}...`)));

io.on('connection', (socket) => {
  socket.emit('message', 'Hello World');
});

const authRoute = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const usersRoute = require('./routes/users');
const menu = require('./routes/menu');
// const verify = require('./routes/verifyToken');

app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use('/api/user', authRoute);
app.use('/api/orders', ordersRoutes);
app.use('/api/menu', menu);
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

app.get('/payment', (req, res) => {
  res.sendFile(path.resolve('./public/pages/payment.html'));
});

app.get('/newItem', (req, res) => {
  res.sendFile(path.resolve('./public/pages/newItem.html'));
});

// const port = process.env.PORT || config.get('port');
// app.listen(port, () => console.log(`Listening on port ${port}...`));
