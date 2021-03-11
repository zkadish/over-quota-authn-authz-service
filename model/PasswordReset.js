const { Schema, model } = require('mongoose');

const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  token: {
    type: Schema.Types.String,
    require: true 
  }
}, {
  timestamps: true
});

schema.index({ 'updatedAt': 1 }, { expireAfterSeconds: 600 });

const PasswordReset = model('PasswordReset', schema);

module.exports = PasswordReset;
