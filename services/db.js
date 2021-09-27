const mongoose = require('mongoose');

module.exports = function configDb() {
  // const db = config.get('db');
  // mongoose.connect(db).then(() => console.log(`Connected to ${db}...`));
  mongoose

    .connect(process.env.MONGO_URI || 'mongodb+srv://lior:123A456@cluster0.niksj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })

    .then(console.log('MongoDB connected'))

    .catch((err) => console.log(err));
};
