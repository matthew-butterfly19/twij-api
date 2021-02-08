const router = require('express').Router();
const quizzesRoute = require('./quizzes');

router.use(quizzesRoute);

module.exports = router;
