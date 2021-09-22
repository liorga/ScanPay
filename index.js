const express = require('express');
const config = require('config');

const app = express();
require('./services/db')();

const authRoute = require('./routes/auth');
const verify = require('./routes/verifyToken');

app.get('/asa', verify, (req, res) => {
  res.json({ secret: 42 });
});

app.use(express.json());
app.use('/api/user', authRoute);

const port = process.env.PORT || config.get('port');
// const server =
app.listen(port, () => console.log(`Listening on port ${port}...`));

// module.exports = server;
