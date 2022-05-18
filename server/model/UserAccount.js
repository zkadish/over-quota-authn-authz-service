const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userAccountSchema = new Schema({
  id: {
    type: String,
    // must be unique, undefined or null
    index: {
      unique: true,
      partialFilterExpression: { account_id: { $type: "string" } },
    },
  },
  active: {
    type: Boolean,
    default: false,
  },
  googleCalendarAuth: {
    type: Object,
    default: null,
  },
  callEventHistory: {
    type: Number,
    default: 5,
  },
  callEventFuture: {
    type: Number,
    default: 5,
  }
});

module.exports = mongoose.model('UserAccount', userAccountSchema);
