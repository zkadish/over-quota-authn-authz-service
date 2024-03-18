const { mongoDB, mongoSession } = require('./index');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo').default;

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

const mongoSessionStore = MongoStore.create({ mongoUrl: mongoSession });

module.exports = { initMongo, mongoSessionStore };
