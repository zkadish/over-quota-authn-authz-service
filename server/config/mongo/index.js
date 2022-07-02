if (process.env.MODE === 'local') {
  console.log('MONGODB_LOCAL');
  console.log(process.env.MONGO_LOCAL);
  module.exports = {
    // mongoDB: process.env.MONGO_CONNECT_TEST,
    mongoDB: process.env.MONGO_LOCAL,
    mongoSession: process.env.MONGO_SESSION_LOCAL,
    jwtSecret: process.env.JWT_SECRET,
  }
} else if (process.env.MODE === 'dev') {
  console.log('MONGO_DEV');
  console.log(process.env.MONGO_DEV);
  module.exports = {
    // mongoDB: process.env.MONGO_CONNECT_TEST,
    mongoDB: process.env.MONGO_DEV,
    mongoSession: process.env.MONGO_SESSION_DEV,
    jwtSecret: process.env.JWT_SECRET,
  }
} else if (process.env.MODE === 'prod') {
  console.log('MONGODB_PROD');
  module.exports = {
    mongoDB: process.env.MONGO_PROD,
    mongoSession: process.env.MONGO_SESSION_PROD,
    jwtSecret: process.env.JWT_SECRET,
  }
}

