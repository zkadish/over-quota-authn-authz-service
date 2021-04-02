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
  corporate_account_id: {
    type: String,
    unique: true,
    default: '',
  },
  email: { // work email
    type: String,
    unique: true,
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  alt_email: {
    type: String,
    unique: true,
    default: '',
  },
  isAltEmailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    default: null,
  },
  phoneNumber: {
    type: String,
    default: '',
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  authenticated: {
    type: Boolean,
    default: false,
  },
  lastActive: {
    type: Date,
    default: Date.now(),
  },
  createdOn: {
    type: Date,
    default: Date.now(),
  },
  account_owner: {
    type: Boolean,
    default: true,
  },
  accountType: { // license-type?
    type: String,
    default: 'test-user', // single-user, multi-user, test-user, guest-user
  },
  features: { // license-upgrades?
    type: Array,
    default: ['BASE'],
  },
  rolesPermissions: {
    type: String,
    default: 'admin', // account owner, super-admin, admin, manager, user, guest
  },
  emailLists: {
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
  }
});

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
