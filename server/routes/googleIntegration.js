var express = require('express');
var router = express.Router();
const { uuid } = require('../utils/data');

const { google } = require('googleapis');
const { watchCalendarEvents } = require('../services/googleIntegration');

const UserAccount = require('../model/UserAccount');

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/app/user-settings', // replace with location.origin
);

oAuth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    // store the refresh_token in my database!
    console.log('refresh_token:', tokens.refresh_token);
  }
  console.log('access_token:', tokens.access_token);
});

/* GET google auth */
router.get('/v1/calendar/auth', async (req, res, next) => {
  console.log('GET: calendar/auth');

  const scopes = [
    // 'https://www.googleapis.com/auth/blogger',
    'https://www.googleapis.com/auth/calendar'
  ];
  
  const url = await oAuth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
  
    // If you only need one scope you can pass it as a string
    scope: scopes
  });

  return res.status(200).json({ googleCalendarRedirectUrl: url });
});

// POST set google auth
router.post('/v1/calendar/auth', async (req, res, next) => {
  console.log('POST: /v1/calendar/auth');

  // This will provide an object with the access_token and refresh_token.
  // Save these somewhere safe so they can be used at a later time.
  const getTokenRes = await oAuth2Client.getToken(req.body.code)
                            .catch(err => {
                              console.log('getToken Error:', err);
                              res.status(err.code).json(err);
                            });
  // if no errors authorize the client
  oAuth2Client.setCredentials(getTokenRes.tokens);

  // add Google auth object to User in data base
  const { account_id } = req.body.user;
  const userAccount = await UserAccount.findOne({ account_id });
 
  if (userAccount) {
    userAccount.googleCalendarAuth = getTokenRes.tokens;
    userAccount.save();
  }

  const calendar = await google.calendar({ version: 'v3', auth: oAuth2Client });

  // set up push notification for watching calendar events
  // const date = new Date();
  // const expiration = date.setDate(date.getDate() + 1); // currently will expire in one day
  // const notifications = watchCalendarEvents(
  //   getTokenRes.tokens.access_token,
  //   {
  //   id: uuid(),
  //   type: 'web_hook',
  //   address: 'https://dev.auth.viewportmedia.org/api/google/v1/calendar/push/notification',
  //   token: 'target=myApp-test',
  //   expiration,
  // });

  // notifications.then(data => {
  //   console.log(data);
  // }).catch(err => {
  //   console.log(err);
  // });

  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    if (events.length) {
      console.log('Upcoming 10 events:', events);
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
  
  return res.status(200);
});

/* GET google calendar events */
router.get('/v1/calendar/events', async (req, res, next) => {
  console.log('GET: calendar/events');
  const { body: { userSettings, today, endDate } } = req;
  // const timeMin = (new Date()).toISOString(); // today
  const timeMin = new Date(today).toISOString(); // today
  // timeMin.setHours(00);
  // timeMin.setSeconds(00);
  // timeMin.setMinutes(00);

  const timeMax = new Date(endDate); // days in the future

  if (!userSettings.googleCalendarAuth) {
    return res.status(200).json({
      message: 'Error: User has not authorized a google calendar.',
      googleCalEvents: [],
    });
  }

  oAuth2Client.setCredentials(userSettings.googleCalendarAuth);

  const calendar = await google.calendar({ version: 'v3', auth: oAuth2Client });

  calendar.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    // timeMin: (new Date('2022-05-02')).toISOString(), // some other day
    maxResults: 2500, // this is the max google calendar api with return
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, response) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = response.data.items;
    if (events.length) {
      console.log('Upcoming 10 events:', events);
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
    return res.status(200).json({ googleCalEvents: events });
  });
});

/* POST google calendar watch receive notification */
router.post('/v1/calendar/push/notification', async (req, res, next) => {
  try {
    const { headers, body } = req;

    // await UserAccount.updateOne(
    //   { account_id: headers['user-account-id'] },
    //   body,
    //   { runValidators: true },
    // );

    // const userAccount = await UserAccount.findOne({ account_id: headers['user-account-id'] });

    res.status(200);
  } catch (error) {
    throw error;
  }
});

module.exports = router;
