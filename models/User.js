var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema(
  {
    clickupId: String,
    name: String,
    email: String,
    token: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      default: 0,
    },
    trackedTasks: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
