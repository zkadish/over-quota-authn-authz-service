const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const corporateAccountSchema = new Schema({
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
  company_name: {
    type: String,
    default: '',
  },
  account_owner: {
    type: Boolean,
    default: true,
  },
  company_address: {
    type: String,
    default: '',
  },
  // googleCalendarAuth: {
  //   type: Object,
  //   default: null,
  // },
  // callEventHistory: {
  //   type: Number,
  //   default: 5,
  // },
  // callEventFuture: {
  //   type: Number,
  //   default: 5,
  // }
});

module.exports = mongoose.model('CorporateAccount', corporateAccountSchema);
