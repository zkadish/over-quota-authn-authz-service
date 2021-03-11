const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const Refresh = require('../model/Refresh');
const crypto = require('crypto');
const { v4 } = require('uuid');
const PasswordReset = require('../model/PasswordReset');
const { sendEmail } = require('../nodemailer/nodemailer');
const { sanitizeUser } = require('../utils/authn');

/**
 * @method - POST
 * @param - /register
 * @description - Register User by adding their email to the database
 * @note - user is not active...
 */
 router.post(
   '/register-user',
   body('email').isEmail(),
   body('emailLists'),
   async (req, res) => {
     try {
      const errors = await validationResult(req);
      if (!errors.isEmpty()) throw errors;
    
      // If there are no errors
      const { email } = req.body;
      const userExists = await User.findOne({ email });
      // If user doesn't exist register the user with their email and set their emailLists setting
      if (!userExists) {
        // create and save the user, redirect to create password and return user to FE
        // note: user only has an email at this point, and doesn't have a password
        const user = await User.create(req.body);
        console.log('redirect: CREATE_PASSWORD');
        return res.status(200).json({ redirect: 'CREATE_PASSWORD', user });
      }
      // user exists and doesn't have a password
      if (userExists.password === null) {
        console.log('redirect: CREATE_PASSWORD');
        return res.status(200).json({ redirect: 'CREATE_PASSWORD', user: userExists });
      }
      // if user exists return where the user should redirect
      if (userExists.password) {
        const user = sanitizeUser(userExists);
        console.log('redirect: LOGIN');
        return res.status(200).json({ redirect: 'LOGIN', user });
      }
     } catch (error) {
      console.log(error);
      if (typeof error === 'string') {
        return res.status(400).json({ error });
      }

      return res.status(400).json({ errors: error.array() });
    }
   }
 );

 /**
 * @method - POST
 * @param - /create-password
 * @description - Add a password to the registered email
 * @note - user becomes active...
 */
 router.post(
  '/create-password',
  body('email').isEmail(),
  body('password').custom((value, { req }) => {
    const regexPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])[\S]{8,}$/;
    if (!regexPassword.test(value)) {
      throw new Error('Password must contain at least 8 characters and must have a letter and a number.');
    }
    return true;
  }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Confirmation password does not match password.');
    }
    return true;
  }),
  async (req, res) => {
    console.log('/create-password')
    try {
      const errors = await validationResult(req);
      if (!errors.isEmpty()) throw errors;
    
      // If there are no errors
      const { email } = req.body;
      const userExists = await User.findOne({ email });
      if (userExists) {
        userExists.password = req.body.password; // add users password
        userExists.active = true; // set user to active
        const user = await userExists.save();

        // redirect to the sign in page
        res.status(200).json({ redirect: 'LOGIN' });
        return;
      }
      
      if (!userExists) {
        // throw 'User doesn't exists.';
        res.status(200).json({ redirect: 'REGISTER_USER', user });
      }
    } catch (error) {
      console.log(error);
      if (typeof error === 'string') {
        return res.status(400).json({ error });
      }

      return res.status(400).json({ errors: error.array() });
    }
  }
 );

 /**
 * @method - POST
 * @param - /login
 * @description - Authenticates the user and generates an auth token and refresh token
 * @todo - prevent 2 accounts being logged into with the same browser instance
 * @todo - check if session already exists and if email is different... warn the user they
 * have to open another browser instance to log into 2 accounts...
 */
router.post(
  '/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw errors;

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) throw 'There is no account with that email.';

      // Compare passwords with bcrypt.compare method 
      // the first password parameter is the one in plain text, 
      // and the second user.password is the hashed password
      const match = await bcrypt.compare(password, user.password);
      if (!match) throw 'The password is incorrect';
  
      // generate an access token
      // encode user._id and user.email into the token
      const accessToken = jwt.sign(
        { _id: user._id, email: user.email },
        jwtSecret,
        { expiresIn: '5m' });
  
      // generate a refresh token 
      const refreshToken = crypto.randomBytes(32).toString('hex');
      await Refresh.create({
        user: user._id,
        token: refreshToken});

      user.lastActive = Date.now();
      await user.save();

      // res.cookie('name', 'express', { maxAge: 30000 }).send('cookie set'); //Sets name = express
      req.session.user = user;
      const userCopy = { ...user };
      delete userCopy.password;
      req.session.authenticated = true;
      res.status(200).json({ redirect: 'APP', data: { accessToken, refreshToken }, user });
    } catch (error) {
      console.log(error)
      if (typeof error === 'string') {
        return res.status(400).json({ error });
      }

      return res.status(400).json({ errors: error.array() });
    };
  }
);

router.get('/authn', (req, res) => {
  // console.log('sessionID: ', req.sessionID);
  console.log('session', req.session)
  if (!req.session.authenticated) {
    res.status(401).json({ authenticated: false });
    return;
  }

  console.log('User authenticated.')
  res.status(200).json({ authenticated: true, user: req.session.user })
});

router.get('/sign-out', (req, res) => {
  req.session.destroy(() => {
    // TODO: delete access and refresh tokens
    console.log('Session has been revoked!')
  });
  res.status(200).json({ redirect: 'LOGIN'})
})

 /**
 * @method - POST
 * @param - /forgot-password
 * @description - Sends an password reset link to the users email
 */
router.post(
  '/forgot-password',
  body('email').isEmail(),
  async (req, res) => {
    console.log('router: /forgot-password')
    try {
      const errors = await validationResult(req);
      if (!errors.isEmpty()) throw errors;
    
      // If there are no errors
      const { email } = req.body;
      const userExists = await User.findOne({ email });
      // If user doesn't exist register the user with their email and set their emailLists setting
      console.log(userExists);
      if (!userExists) {
        // throw error 449 "retry with"
        res.status(449).json({ error: 'Your email is not registered, do you need to create an account?' });
        return;
      }
      // Create password reset token and save in collection with user
      // if a user record exists replace with new token
      const resetToken = v4().toString().replace(/-/g, '');
      PasswordReset.updateOne({
        user: userExists._id
      }, {
        user: userExists._id,
        token: resetToken
      }, {
        upsert: true
      })
      .then(updateResponse => {
        console.log(updateResponse)
        const resetLink = `${process.env.CLIENT_DOMAIN}/#/reset-password/${resetToken}`;
        // console.log(resetLink);

        // res.status(200).json({ redirect: 'LOGIN'});
        sendEmail({
          to: userExists.email, 
          subject: 'Password Reset',
          text: `
            Hi ${userExists.name}, here's your password reset link: <a href="${resetLink}" target="_blank">${resetLink}</a>.
            If you did not request this link, ignore it. test.
          `
        }).then(data => {
          console.log('Email was sent.');
          return res.status(200).json({ message: 'Password reset email was sent.' })
        });

        return
      })
      .catch(error => {
        console.log(error);
        return res.status(400).json({ error });
      })
    } catch (error) {
      console.log(error);
      if (typeof error === 'string') {
        return res.status(400).json({ error });
      }

      return res.status(400).json({ errors: error.array() });
    }
  }
);

/**
 * @method - GET
 * @param - /validate-reset/:token
 * @description - validates token and returns the user in res body
 */
router.get('/validate-reset/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const passwordReset = await PasswordReset.findOne({ token });
    console.log('/validate-reset/:token')
    console.log(token)
    console.log(passwordReset)

    if (!passwordReset) {
      res.status(404).json({ error: 'Reset link has expired.' });
      return;
    }

    const user = await User.findOne({ _id: passwordReset.user });
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post(
  '/reset-password/:token',
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const errors = await validationResult(req);
      if (!errors.isEmpty()) throw errors;

      const { password } = req.body;
      const { token } = req.params;
      const passwordReset = await PasswordReset.findOne({ token });
      // console.log('/reset-password')
      // console.log(token)
      // console.log(passwordReset)

      if (!passwordReset) {
        throw 'Reset link has expired.';
        // res.status(404).json({ error: 'Reset link has expired.' });
        // return;
      }
      // update the user
      const userExists = await User.findOne({ _id: passwordReset.user });
      userExists.password = password;
      // save new password in db and email user
      await userExists.save().then(user => {
        sendEmail({
          to: user.email, 
          subject: 'Password Reset Successful',
          text: `Congratulations your SkillUp password reset was successful.`
        });
      });

      // delete password reset document in collection
      await PasswordReset.deleteOne({ _id: passwordReset._id });

      // redirect to login page with success message
      res.status(200).json({ redirect: 'LOGIN'});
    } catch (error) {
      res.status(400).json({ error });
    }
  }
);

 module.exports = router;