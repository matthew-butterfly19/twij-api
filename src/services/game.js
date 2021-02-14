const Event = require('../models/event');
const {UserStatuses} = require("../constants/UserStatuses");

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
        answer: 0,
      })),
    },
    userGameData: userData,
  };
}

exports.startGameForUser = async (eventId, email) => {
  console.log(eventId, email);
  await Event.updateOne(
  {
    _id: eventId,
    members: { $elemMatch: { email }},
  }, {
    $set: {
      "members.$.status" : UserStatuses.pending,
    }
  });
}

exports.finishGame = async (eventId, email, answers) => {
  await Event.updateOne(
    {
      _id: eventId,
      members: { $elemMatch: { email }},
    }, {
      $set: {
        "members.$.status" : UserStatuses.finished,
        "members.&.answers" : answers,
      }
    });
}
