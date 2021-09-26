const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('working changed');
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));