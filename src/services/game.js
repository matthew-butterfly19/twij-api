const Event = require('../models/event');
const {Statuses} = require("../constants/UserStatuses");
const moment = require('moment');
const mongoose = require('mongoose');

exports.getGameForUser = async (eventId, email) => {
  const event = await Event.findById(eventId);
  const userData = event.members.find(member => member.email === email);
  return {
    gameData: {
      name: event.name,
      subject: event.subject,
      startTime: event.startTime,
      startTimeEnd: event.startTimeEnd,
      eventDurationInMinutes: event.eventDurationInMinutes,
      questions: event.questions.map(question => ({
        id: question.id,
        question: question.question,
        answerA: question.answerA,
        answerB: question.answerB,
        answerC: question.answerC,
        answerD: question.answerD,
        answer: question.answer,
        points: question.points,
      })),
    },
    userGameData: userData,
  };
}

exports.startGameForUser = async (eventId, email) => {
  await Event.updateOne(
  {
    _id: eventId,
    members: { $elemMatch: { email }},
  }, {
    $set: {
      "members.$.status" : Statuses.pending,
      "members.$.timeStart" : moment(),
    }
  });
}

exports.finishGame = async (eventId, email, answers, points) => {
  await Event.updateOne(
    {
      _id: eventId,
      members: { $elemMatch: { email }},
    }, {
      $set: {
        "members.$.status" : Statuses.finished,
        "members.$.timeEnd" : moment(),
        "members.$.pointsSummary" : points,
        "members.$.answers" : answers,
      }
    });
}
