const path = require('path');
const fs = require('fs');

module.exports = function sendErrorPage(code, msg, res) {
  let index = fs.readFileSync(path.join(__dirname, '../public/pages/error.html'), 'utf-8');

  index = index.replace(/##CODE##/g, `${code}`);
  index = index.replace(/##MSG##/g, `${msg}`);
  return res.status(code).send(index);
};
