require('dotenv').config();
const { initMongo, mongoSessionStore } = require('./config/mongo/db');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const compression = require("compression");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const userAccountRouter = require('./routes/userAccount');
const authRouter = require('./routes/auth');
const googleRouter = require('./routes/googleIntegration');

// TODO: if you don't wind up using mailchip remove remove it
// require('./nodemailer/nodemailer');
// require('./mailchimp/mailchimp');

const app = express();
const db = initMongo();

console.log('app.get("env") = ', app.get('env'));
console.log('process.env.APP_SECRET:', process.env.APP_SECRET);

let cookieDomain = '';
let cookieSecure = false;
let corsOrginUrls = ['http://localhost:3000'];

if (app.get('env') === 'local') {
  cookieDomain = '';
  cookieSecure = false;
  corsOrginUrls = ['http://localhost:3000'];
}
if (app.get('env') === 'development') {
  app.set('trust proxy', true); // required to pass secure cookie
  cookieDomain = '.viewportmedia.org';
  cookieSecure = true;
  corsOrginUrls = ['https://dev.auth.spa.viewportmedia.org'];
}
if (app.get('env') === 'production') {
  app.set('trust proxy', true); // required to pass secure cookie
  cookieDomain = '.viewportmedia.org';
  cookieSecure = true;
  corsOrginUrls = ['https://dev.auth.spa.viewportmedia.org'];
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
app.use(cookieParser()); // required to pass secure cookie

// // server session config
app.use(session({
  genid: (req) => {
    console.log('Inside the session middleware');
    console.log('req.sessionID:', req.sessionID);
    return uuidv4(); // use UUIDs for session IDs
  },
  secret: process.env.APP_SECRET,
  resave: false,
  saveUninitialized: false,
  // unset: 'destroy',
  cookie: {
    domain: cookieDomain, // '.viewportmedia.org' || 'localhost' // required to pass secure cookie
    secure: cookieSecure, // true || false // required to pass secure cookie
    // sameSite: 'none',
    // maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    // maxAge: 1000 * 5, // 5 sec
    // maxAge: 1000 * 60, // 1 min
    maxAge: 1000 * 60 * 30, // 30 min
  },
  // rolling: true,
  store: mongoSessionStore,
}));

// Add cors to the headers of every request endpoint 
// Client also needs `axios.defaults.withCredentials = true;` on every request
// or session cookie won't get passed to the client
console.log('corsOrginUrls:', corsOrginUrls);
app.use(cors({
  origin: corsOrginUrls, // required to pass secure cookie
  credentials: true, // required to pass secure cookie
  exposedHeaders: ['set-cookie'], // required to pass secure cookie
}));

// NOTE: other headers which could be used...
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Credentials", true);
//   // res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-HTTP-Method-Override");
//   res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
//   next();
// });

app.use(express.static(path.join(__dirname, 'public')));

// remove the trialing slash from incoming routes
app.use((req, res, next) => {
	if (req.path.endsWith('/') && req.path.length > 1) {
  // if (req.path.substr(-1) == '/' && req.path.length > 1) {
		const query = req.url.slice(req.path.length)
		res.redirect(301, req.path.slice(0, -1) + query)
	} else {
		next()
	}
});

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/user-account/v1', userAccountRouter);
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
