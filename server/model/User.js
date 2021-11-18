const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userSchema = new Schema({
  first_name: {
    type: String,
    default: '',
  },
  last_name: {
    type: String,
    default: '',
  },
  company_name: {
    type: String,
    default: '',
  },
  corporate_id: {
    type: String,
    // must be unique, undefined or null
    index: {
      unique: true,
      partialFilterExpression: { corporate_id: { $type: "string" } },
    },
  },
  account_id: {
    type: String,
    // must be unique, undefined or null
    index: {
      unique: true,
      partialFilterExpression: { account_id: { $type: "string" } },
    },
  },
  email: { // work email
    type: String,
    unique: true,
    required: true,
  },
  is_email_verified: {
    type: Boolean,
    default: false,
  },
  alt_email: {
    type: String,
    // must be unique, undefined or null
    index: {
      unique: true,
      partialFilterExpression: { alt_email: { $type: "string" } },
    },
  },
  is_alt_email_verified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    default: null,
  },
  phone_number: {
    type: String,
    // must be unique, undefined or null
    index: {
      unique: true,
      partialFilterExpression: { phone_number: { $type: "string" } },
    },
  },
  is_phone_verified: {
    type: Boolean,
    default: false,
  },
  authenticated: {
    type: Boolean,
    default: false,
  },
  last_active: {
    type: Date,
    default: Date.now(),
  },
  created_on: {
    type: Date,
    default: Date.now(),
  },
  account_owner: {
    type: Boolean,
    default: true,
  },
  account_type: { // license-type?
    type: String,
    default: 'test-user', // single-user, multi-user, test-user, guest-user
  },
  features: { // license-upgrades?
    type: Array,
    default: ['BASE'],
  },
  permissions_role: {
    type: String,
    default: 'admin', // account owner, super-admin, admin, manager, user, guest
  },
  email_lists: {
    type: Array,
    default: [], // 'NEWS_LETTER', 'MARKETING'
  },
  teams: { // groups???
    type: Array,
    default: [],
  },
  active: {
    type: Boolean,
    default: false,
  },
  company_address: {
    type: String,
    default: '',
  },
  alt_address: {
    type: String,
    default: '',
  },
  billing_address: {
    type: String,
    default: '',
  },
  cc_info: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  googleCalendarAuth: {
    type: Object,
    default: null,
  },
});
userSchema.plugin(require('mongoose-beautiful-unique-validation'));
userSchema.pre('save', async function () {
  try {
    const user = this;

    // if (user.isNew || user.isModified('password')) {
    if (user.isModified('password')) {
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
  } catch (error) {
    throw error;
  }
});

module.exports = mongoose.model('User', userSchema);
