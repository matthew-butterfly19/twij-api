const router = require('express').Router();
const controllers = require('../controllers/quizzes');

router.route('/quizzes')
  .get(controllers.getQuizzes);

router.route('/quiz')
  .get(controllers.getQuiz);

router.route('/quiz')
  .delete(controllers.removeQuiz);

router.route('/quiz')
  .post(controllers.updateQuiz);

module.exports = router;
