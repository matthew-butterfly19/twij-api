const jwt = require('jsonwebtoken');
const { secretKey } = require('../services/event');
const services = require('../services/game');
const moment = require('moment');
const {Statuses} = require("../constants/UserStatuses");

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
  if (!token) {
    res.sendStatus(400);
  }
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
  if (userGameData.status === Statuses.finished) {
    res.send({
      status: GameResponseStatuses.finished,
    });
    return;
  }
  if (userGameData.status === Statuses.awaiting && canBeStarted) {
    res.send({
      status: GameResponseStatuses.canBeStarted,
      gameData: {
        ...commonQuizProps,
        startTimeEnd: gameData.startTimeEnd,
        eventDurationInMinutes: gameData.eventDurationInMinutes,
        questionsCount: gameData.questions.length,
      }
    });
    return;
  }
  if (userGameData.status === Statuses.awaiting && !canBeStarted) {
    res.send({
      status: GameResponseStatuses.timeToStartOver,
    });
    return;
  }

  const finishTime = moment(userGameData.timeStart).add(gameData.eventDurationInMinutes, 'minutes');
  const canBeFinished = finishTime.isAfter(moment());
  if (userGameData.status === Statuses.pending && canBeFinished) {
    res.send({
      status: GameResponseStatuses.pending,
      gameData: {
        ...commonQuizProps,
        finishTime: finishTime,
        questions: gameData.questions.map(quest => ({
          id: quest.id,
          question: quest.question,
          answerA: quest.answerA,
          answerB: quest.answerB,
          answerC: quest.answerC,
          answerD: quest.answerD,
          answer: -1,
        })),
      }
    });
    return;
  }
  if (userGameData.status === Statuses.pending && !canBeFinished) {
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

  if (userGameData.status === Statuses.awaiting && canBeStarted) {
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
  if (userGameData.status === Statuses.pending && canBeFinished) {
    let pointsSummary = 0;
    const answers = reqAnswers.reduce((accum, answer) => {
      const question = gameData.questions.find(quest => quest.id === answer.id);
      if (!question) {
        return accum;
      }
      const userAnswer = [question.answerA, question.answerB, question.answerC, question.answerD][answer.answer];
      const correctAnswer = [question.answerA, question.answerB, question.answerC, question.answerD][question.answer];
      const pointsForQuestion = answer.answer === question.answer ? question.points : 0;
      pointsSummary += pointsForQuestion;
      return [
        ...accum,
        {
          questionId: question.id,
          question: question.question,
          answer: userAnswer || 'brak odpowiedzi',
          points: answer.answer === question.answer ? question.points : 0,
          correctAnswer,
          correctAnswerPoints: question.points,
        }];
    }, []);
    await services.finishGame(user.eventId, user.email, answers, pointsSummary);
    res.sendStatus(200);
  }
}
