const { mongoDB } = require('./index');
const mongoose = require('mongoose');

const initMongo = async () => {
  try {
    await mongoose.connect(mongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('mongoDB connected', mongoDB);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = initMongo;
