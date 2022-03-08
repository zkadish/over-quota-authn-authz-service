require('dotenv').config();
const { initMongo, mongoSessionStore } = require('./config/mongo/db');

const path = require('path');
const { v4: uuidv4 } = require('uuid');
const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const compression = require("compression");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
// const MongoDBStore = require('connect-mongodb-session')(session);
// const MongoStore = require('connect-mongo').default;

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const googleRouter = require('./routes/googleIntegration');

// TODO: if you don't wind up using mailchip remove remove it
// require('./nodemailer/nodemailer');
// require('./mailchimp/mailchimp');

const db = initMongo();
const app = express();

console.log('app.get("env") = ', app.get('env'));

let cookieSecure = false;
let cookieDomain = 'localhost';
// TODO: pass the correct env vars with pm2 config
if (app.get('env') === 'production') {
  // app.set('trust proxy', true);
  cookieSecure = true;
  cookieDomain = '.overquota.io';
}

app.disable('x-powered-by');
// app.set('trust proxy', 1);

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
    console.log('req.sessionID:', req.sessionID);
    return uuidv4(); // use UUIDs for session IDs
  },
  secret: process.env.APP_SECRET,
  resave: false,
  saveUninitialized: false,
  unset: 'destroy',
  cookie: {
    domain: 'localhost', // '.overquota.io'
    secure: false,
    // sameSite: 'none',
    // maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    // maxAge: 1000 * 60, // 1 min
    maxAge: 1000 * 60 * 30, // 30 min
  },
  // rolling: true,
  store: mongoSessionStore,
}));

// Add cors to the headers of every request endpoint 
// Client also needs `axios.defaults.withCredentials = true;` on every request
// or session cookie won't get passed to the client
app.use(cors({
  origin: [
    'http://dev.auth.service.overquota.io',
    'http://dev.auth.spa.overquota.io',
  ],
  credentials: true,
  exposedHeaders: ['set-cookie']
})) // cors is set for every route

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

app.use('/', indexRouter);
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
