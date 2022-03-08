if (process.env.MODE === 'local') {
  console.log('LOCAL MONGODB');
  module.exports = {
    // mongoDB: process.env.MONGO_CONNECT_TEST,
    mongoDB: process.env.MONGO_LOCAL,
    mongoSession: process.env.MONGO_SESSION_LOCAL,
    jwtSecret: process.env.JWT_SECRET,
  }
} else if (process.env.MODE === 'dev') {
  console.log('DEV MONGODB');
  module.exports = {
    // mongoDB: process.env.MONGO_CONNECT_TEST,
    mongoDB: process.env.MONGO_DEV,
    mongoSession: process.env.MONGO_SESSION_DEV,
    jwtSecret: process.env.JWT_SECRET,
  }
} else if (process.env.MODE === 'prod') {
  console.log('PROD MONGODB');
  module.exports = {
    mongoDB: process.env.MONGO_PROD,
    mongoSession: process.env.MONGO_SESSION_PROD,
    jwtSecret: process.env.JWT_SECRET,
  }
}

