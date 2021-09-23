const express = require('express');
const config = require('config');
const path = require('path');
const cookieParser = require('cookie-parser');
const { urlencoded } = require('body-parser');

const app = express();
require('./services/db')();

const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');
// const verify = require('./routes/verifyToken');

app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use('/api/user', authRoute);
app.use('/profile', usersRoute);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  if (req.cookies['auth-token']) {
    res.redirect('profile');
  } else {
    res.sendFile(path.resolve('./public/pages/index.html'));
  }
});

app.get('/profile/newItem', (req, res) => {
  res.sendFile(path.resolve('./public/pages/newItem.html'));
});


require('./services/routes')(app);

const port = process.env.PORT || config.get('port');
app.listen(port, () => console.log(`Listening on port ${port}...`));
