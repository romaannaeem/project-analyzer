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

  app.delete('/api/trackedTask/:taskId', (req, res) => {
    try {
      const { taskId } = req.params;
      const { userId } = req.query;

      console.log('taskId', taskId);
      console.log('userId', userId);

      User.findByIdAndUpdate(
        userId,
        { $pull: { trackedTasks: taskId } },
        { new: true },
        (err, event) => {
          if (err) console.log('Error occurred', err);
        }
      );

      res.status(200).send('Task deleted successfully');
    } catch (err) {
      res.status(429).send('Something went wrong deleting the task :(');
    }
  });
};
