const router = require('express').Router();
const controllers = require('../controllers/game');

router.route('/start')
  .post(controllers.startGame);

router.route('/finish')
  .post(controllers.finishGame);

router.route('/*')
  .get(controllers.getGameData);

module.exports = router;
