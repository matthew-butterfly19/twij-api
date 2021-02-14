const jwt = require('jsonwebtoken');
const { secretKey } = require('../services/event');
const services = require('../services/game');
const moment = require('moment');
const {UserStatuses} = require("../constants/UserStatuses");

const GameResponseStatuses = {
  didntStart: 'didntStart',
  canBeStarted: 'canBeStarted',
  pending: 'pending',
  timeToStartOver: 'timeToStartOver',
  timeToFinishOver: 'timeToFinishOver',
  finished: 'finished',
}

exports.getGameData = async (req, res) => {
  const token = req.path.slice(1);
  const decodedToken = decodeURIComponent(token);
  const user = jwt.verify(decodedToken, secretKey);
  const { gameData, userGameData } = await services.getGameForUser(user.eventId, user.email);
  if (!userGameData || !gameData) {
    res.sendStatus(404);
    return;
  }
  const isQuizStarted = moment(gameData.startTime).isBefore(moment(Date.now()));
  const canBeStarted = moment(gameData.startTimeEnd).isAfter(moment(Date.now()));

  const commonQuizProps = {
    name: gameData.name,
    subject: gameData.subject,
  }
  if (!isQuizStarted) {
    res.send({
      status: GameResponseStatuses.didntStart,
      gameData: {
        ...commonQuizProps,
        startTime: gameData.startTime,
      },
    });
    return;
  }
  if (userGameData.status === UserStatuses.finished) {
    res.send({
      status: GameResponseStatuses.finished,
    });
    return;
  }
  if (userGameData.status === UserStatuses.awaiting && canBeStarted) {
    res.send({
      status: GameResponseStatuses.canBeStarted,
      gameData: {
        ...commonQuizProps,
        startTimeEnd: gameData.startTime,
        eventDurationInMinutes: gameData.eventDurationInMinutes,
        questionsCount: gameData.questions.length,
      }
    });
    return;
  }
  if (userGameData.status === UserStatuses.awaiting && !canBeStarted) {
    res.send({
      status: GameResponseStatuses.timeToStartOver,
    });
    return;
  }
  const finishTime = moment(userGameData.startTime).add(gameData.eventDurationInMinutes, 'minutes');
  const canBeFinished = finishTime.isAfter(moment());
  if (userGameData.status === UserStatuses.pending && canBeFinished) {
    res.send({
      status: GameResponseStatuses.pending,
      gameData: {
        ...commonQuizProps,
        finishTime: finishTime,
        questions: gameData.questions,
      }
    });
    return;
  }
  if (userGameData.status === UserStatuses.pending && !canBeFinished) {
    res.send({
      status: GameResponseStatuses.timeToFinishOver,
    });
  }
 }

exports.startGame = async (req, res) => {
  const token = req.body.token;
  const decodedToken = decodeURIComponent(token);
  const user = jwt.verify(decodedToken, secretKey);
  await services.getGameForUser(user.eventId, user.email);

  const { gameData, userGameData } = await services.getGameForUser(user.eventId, user.email);
  if (!userGameData || !gameData) {
    res.sendStatus(404);
    return;
  }
  const canBeStarted = moment(gameData.startTimeEnd).isAfter(moment(Date.now()));

  if (userGameData.status === UserStatuses.awaiting && canBeStarted) {
    await services.startGameForUser(user.eventId, user.email);
  }
  res.sendStatus(200);
}

exports.finishGame = async (req, res) => {
  const token = req.body.token;
  const decodedToken = decodeURIComponent(token);
  const user = jwt.verify(decodedToken, secretKey);
  await services.getGameForUser(user.eventId, user.email);
  const reqAnswers = req.body.answers;
  const { gameData, userGameData } = await services.getGameForUser(user.eventId, user.email);
  if (!userGameData || !gameData) {
    res.sendStatus(404);
    return;
  }
  const canBeFinished = moment(userGameData.startTime).add(gameData.eventDurationInMinutes, 'minutes').isAfter(moment());
  if (userGameData.status === UserStatuses.pending && canBeFinished) {
    const answers = reqAnswers.reduce((accum, answer) => {
      const question = gameData.questions.find(quest => quest.id === answer.id);
      if (!question) {
        return accum;
      }
      const userAnswer = [question.answerA, question.answerB, question.answerC, question.answerD][answer.answer];
      return [
        ...accum,
        {
          questionId: question._id,
          question: question.question,
          answer: userAnswer,
          points: answer.answer === question.answer ? question.points : 0,
          correctAnswer: question.answer,
          correctAnswerPoints: question.points,
        }];
    }, []);
    await services.finishGame(user.eventId, user.email, answers);
    res.sendStatus(200);
  }
}
