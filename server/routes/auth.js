const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const { mongoSessionStore } = require('../config/mongo/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../model/User');
const UserAccount = require('../model/UserAccount');
const PasswordReset = require('../model/PasswordReset');
const Refresh = require('../model/Refresh');

const { sendEmail } = require('../nodemailer/nodemailer');
const { sanitizeUser } = require('../utils/authn');
const provisionUser = require('../utils/provisionUser');
const { uuid } = require('../utils/data');

/**
 * @method - POST
 * @param - /register
 * @description - Register User by adding their email and account id to the database
 * @note - user is not active...
 */
 router.post(
   '/register-user',
   body('email').isEmail(),
   body('emailLists'), // TODO: change this ket to news-letters
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
        // note: user only has an email and an account number at this point, and doesn't have a password yet...
        const newUser = req.body;
        newUser.account_id = uuid();
        const user = await User.create(newUser);
        // once the email is saved and the use is created redirect them to the password creation page
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
 * @executes - provisionUser()
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
    try {
      const errors = await validationResult(req);
      if (!errors.isEmpty()) throw errors;
    
      // If there are no errors
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (user) {
        user.password = req.body.password; // add users password
        user.active = true; // set user to active

        // provision user
        await provisionUser(user);
        const newUser = await user.save();

        // TODO: move into provision user?
        const userAccount = await UserAccount.create({ id: user.account_id, active: true });

        // redirect to the sign in page
        // TODO: pass updated user back to the client?
        res.status(200).json({ redirect: 'LOGIN', newUser });
        return;
      }
      
      if (!user) {
        // throw 'User doesn't exists.';
        res.status(200).json({ redirect: 'REGISTER_USER' });
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

      if (req.session.authenticated) {
        console.log('req.session.authenticated === true');
        res.status(200).json({ authenticated: true, user: sanitizeUser(user) });
        return;
      };

      if (!user) throw 'There is no account with that email.';

      // Compare passwords with bcrypt.compare method 
      // the first password parameter is the one in plain text, 
      // and the second user.password is the hashed password
      const correct = await bcrypt.compare(password, user.password);
      if (!correct) {
        // throw 'The password is incorrect';
        res.status(403).json({ error: 'The password is incorrect' });
        return;
      }
  
      // NOTE: never send refresh tokens to the client!
      const refreshToken = crypto.randomBytes(32).toString('hex');
      await Refresh.create({
        user: user._id,
        token: refreshToken,
      });
      
      // generate an access token
      // encode user._id and user.email into the token
      const accessToken = jwt.sign(
        { _id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '5m' },
      );

      user.lastActive = Date.now();
      user.authenticated = true;
      await user.save();

      const userCopy = { ...user._doc };
      // console.log(userCopy);
      // NOTE: never send the password to the client!
      delete userCopy.password;

      console.log('cookie: ', req.session);
      req.session.authenticated = true;
      req.session.user_id = user._id;
      
      // Respond with accessToken and user DTO.
      console.log('/login', 'status:', 200);
      res.status(200).json({ authenticated: true, accessToken, user: userCopy });
    } catch (error) {
      console.log(error)
      // return res.status(403).json({ message: 'Enter a valid email.' });
      return res.status(403).send({ error });
      // if (typeof error === 'string') return res.status(400).json({ error });
      // return res.status(400).json({ errors: error.array() });
    };
  }
);

router.get(
  '/authn',
  (req, res) => {
  console.log('/authn')
  // console.log('cookie.maxAge: ', req.session.cookie.maxAge);

  const destroySession = () => {
    req.session.destroy(() => {
      // TODO: delete access and refresh tokens
      console.log('Session has been revoked!')
    });
    console.log('response: "{ authenticated: false }"')
    res.status(403).json({ authenticated: false });
    return true;
  };

  if (!req.session) {
    console.log('!req.session', req.session);
    destroySession();
    return;
  }

  // const { user } = req.session;
  console.log('{ authenticated: true }');
  console.log('sessionID', req.sessionID);
  console.log('session', req.session);
  mongoSessionStore.touch(req.sessionID, req.session, async error => {
    try {
      console.log('mongoSessionStore error: ', error);
      if (error) {
        destroySession();
        return;
      }
      console.log('touched() maxAge:', req.session.cookie.maxAge);
      console.log(req.session.user_id);
      const user = await User.findOne({ _id: req.session.user_id });
      const userCopy = { ...user._doc };
      // console.log(userCopy);
      // NOTE: never send the password to the client!
      delete userCopy.password;

      res.status(200).json({ authenticated: true, user: userCopy });
    } catch (error) {
      console.log(error);
    }
  });
});

router.post(
  '/sign-out',
  body('email').isEmail(),
  async (req, res) => {
  console.log('/sign-out', req.body.email);
  try {
    const user = await User.findOne({ email: req.body.email });
    user.authenticated = false;
    await user.save();
    console.log('User.authenticated set to false!');

    const token = await Refresh.findOne({ user: user._id });
    const deleted = await token.remove();
    console.log(`User's refresh token has been deleted!`);

    req.session.destroy(() => {
      // TODO: delete access token
      console.log('Session has been revoked!');
      // console.log('req.session', req.session);
    });
    res.status(200).json({ authenticated: false })
  } catch (error) {
    console.log(error);
  }
});

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
      const resetToken = uuid();
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
        const resetLink = `http://localhost:3000/#/reset-password/${resetToken}`;
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
router.get(
  '/validate-reset/:token',
  async (req, res) => {
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