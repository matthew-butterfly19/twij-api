const router = require('express').Router();
const controllers = require('../controllers/game');

router.route('/data')
  .get(controllers.getGameData);

router.route('/start')
  .get(controllers.startGame);

router.route('/finish')
  .get(controllers.finishGame);

module.exports = router;
