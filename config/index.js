if (process.env.MODE === 'dev') {
  module.exports = {
    // mongoDB: 'mongodb://authuser:authuserpassword@localhost:56702/authServiceDev',
    mongoDB: process.env.MONGO_DEV,
    // mongoSession: 'mongodb://sessionuser:sessionuserpassword@localhost:56702/sessionsDev',
    mongoSession: process.env.MONGO_SESSION_DEV,
    jwtSecret: process.env.JWT_SECRET,
  }
} else {
  module.exports = {
    mongoDB: process.env.MONGO_PROD,
    mongoSession: process.env.MONGO_SESSION_PROD,
    jwtSecret: process.env.JWT_SECRET,
  }
}

