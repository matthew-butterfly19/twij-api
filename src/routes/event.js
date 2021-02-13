const router = require('express').Router();
const controllers = require('../controllers/event');

router.route('/events')
  .get(controllers.getEvents);

router.route('/schedule')
  .post(controllers.scheduleTest);

module.exports = router;
