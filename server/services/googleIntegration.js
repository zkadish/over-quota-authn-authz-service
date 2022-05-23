const axios = require('axios');
// const { uuid } = require('../utils/data');

// let authDomain = 'http://localhost:7777';
// if (process.env.NODE_ENV === 'development') {
//   authDomain = 'https://dev.auth.service.overquota.io';
// }

// POST set google calendar event watch
const watchCalendarEvents = async (authToken, options) => {
  try {
    const response = await axios({
      method: 'post',
      url: `https://www.googleapis.com/calendar/v3/calendars/zachkadish@zachkadish.com/events/watch`,
      data: options,
      headers: {
        'Content-Type': 'application/json',
        // 'user-account-id': user.account_id,
        Authorization: authToken,
      }
    });
  
    const { data } = response;
    return data;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  watchCalendarEvents,
};
