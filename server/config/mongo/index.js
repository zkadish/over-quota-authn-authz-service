const getMongoSettings = () => {
  console.log('NODE_ENV =', process.env.NODE_ENV);
  let mongoConfig = null;
  if (process.env.NODE_ENV === 'local') {
    console.log(`mongodb://authuser:${process.env.MONGO_LOCAL_PASSWORD}@localhost:56702/authServiceLocal`)
    mongoConfig = {
      mongoDB: `mongodb://authuser:${process.env.MONGO_LOCAL_PASSWORD}@localhost:56702/authServiceLocal`,
      mongoSession: `mongodb://sessionuser:${process.env.MONGO_SESSION_LOCAL}@localhost:56702/sessionsLocal`,
    }
  } else if (process.env.NODE_ENV === 'development') {
    mongoConfig = {
      mongoDB: `mongodb://authuser:${process.env.MONGO_DEV_PASSWORD}@dev.auth.mongo.viewportmedia.org:27017/authServiceDev`,
      mongoSession: `mongodb://sessionuser:${process.env.MONGO_SESSION_LOCAL}@dev.auth.mongo.viewportmedia.org:27017/sessionsDev`,
    }
  } else {
    mongoConfig = {
      mongoDB: `mongodb://authuser:${process.env.MONGO_PROD_PASSWORD}@localhost:56702/authService`,
      mongoSession: `mongodb://sessionuser:${process.env.MONGO_SESSION_LOCAL}@localhost:56702/sessions`,
    }
  }
  return mongoConfig;
}

module.exports = getMongoSettings;
