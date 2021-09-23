const express = require('express');
const config = require('config');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve("./public/html/index.html"));
});


require('./services/routes')(app);
require('./services/db')();

const port = process.env.PORT || config.get('port');
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));

module.exports = server;
