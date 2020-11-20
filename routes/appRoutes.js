const { baseClientURL } = require('../config/keys');
const User = require('../models/User');

module.exports = (app) => {
  app.post('/api/trackedTask', (req, res) => {
    User.findByIdAndUpdate(
      req.body.userId,
      {
        $push: { trackedTasks: req.body.taskId },
      },
      { safe: true, upsert: true, new: true },
      function (err, model) {
        console.log(err);
      }
    );

    res.redirect(baseClientURL);
  });
};
