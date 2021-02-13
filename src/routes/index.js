const router = require('express').Router();

const quizRoute = require('./quiz');
const eventRoute = require('./event');
const gameRoute = require('./game');

router.use(quizRoute);
router.use(eventRoute);
router.use(gameRoute);

module.exports = router;
