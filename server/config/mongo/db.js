// const { mongoDB, mongoSession } = require('./index');
const getMongoSettings = require('./index');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo').default;

const mongoConfig = getMongoSettings();
const initMongo = async () => {
  try {
    await mongoose.connect(mongoConfig.mongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true, // no longer supported by mongoose
    });
    console.log('mongoDB connected', mongoConfig.mongoDB);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const mongoSessionStore = MongoStore.create({ mongoUrl: 'mongodb://sessionuser:sessionuserpassword@localhost:56702/sessionsLocal' });

module.exports = { initMongo, mongoSessionStore };
