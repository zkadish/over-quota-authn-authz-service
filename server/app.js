require('dotenv').config();
const { initMongo, mongoSessionStore } = require('./config/mongo/db');

const path = require('path');
const { v4: uuidv4 } = require('uuid');
const createError = require('http-errors');
const express = require('express');
const compression = require("compression");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
// const MongoDBStore = require('connect-mongodb-session')(session);
// const MongoStore = require('connect-mongo').default;

// const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const googleRouter = require('./routes/googleIntegration');

// TODO: if you don't wind up using mailchip remove remove it
// require('./nodemailer/nodemailer');
// require('./mailchimp/mailchimp');

const db = initMongo();
const app = express();
// const mongoSessionStore = MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/serverSessions' });
// const mongoSessionStore = new MongoDBStore({
//   // TODO: make sure to use env to pass connection string
//   uri: 'mongodb://localhost:27017/connect_mongodb_session_dev',
//   collection: 'mySessions'
// });

// mongoSessionStore.on('error', function(error) {
//   console.log('mongoSessionStore', error);
// });

let cookieSecure = false;
if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  cookieSecure = true;
}

app.disable('x-powered-by');

// view engine setup
// TODO: if you don't use views remove the view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(compression())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// server session config
app.use(session({
  genid: (req) => {
    console.log('Inside the session middleware');
    console.log(req.sessionID);
    return uuidv4(); // use UUIDs for session IDs
  },
  secret: process.env.APP_SECRET,
  cookie: {
    // secure: cookieSecure,
    secure: false,
    // maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    // maxAge: 1000 * 60, // 1 min
    maxAge: 1000 * 60 * 30, // 30 min
  },
  // rolling: true,
  store: mongoSessionStore,
  // store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/serverSessions' }),
  resave: true,
  saveUninitialized: false,
}));
app.use(express.static(path.join(__dirname, 'public')));

// remove the trialing slash from incoming routes
app.use((req, res, next) => {
	if (req.path.substr(-1) == '/' && req.path.length > 1) {
		const query = req.url.slice(req.path.length)
		res.redirect(301, req.path.slice(0, -1) + query)
	} else {
		next()
	}
});

// app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/google', googleRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
