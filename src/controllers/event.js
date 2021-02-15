const services = require('../services/event');
const {Statuses} = require("../constants/UserStatuses");
const moment = require('moment');

const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

exports.scheduleTest = async (req, res) => {
  const test = req.body.test;
  test.emails = test.emails.filter(email => validateEmail(email));

  if (test.questionsIds.length === 0 || test.emails.length === 0) {
    res.sendStatus(400);
  }

  await services.scheduleTest(test);
  res.sendStatus(200);
}

exports.getEvents = async (req, res) => {
  const events = await services.getEvents();
  const preparedEvents = events.map(event => {
    const getQuizStatus = () => {
      const isQuizStarted = moment(event.startTime).isBefore(moment(Date.now()));
      if (!isQuizStarted) {
        return Statuses.awaiting;
      }
      const isTooLateForStart = moment(event.startTimeEnd).isBefore(moment(Date.now()));
      const isSomeonePending = event.members.find(member => member.status !== Statuses.finished);
      const finishTime = moment(event.startTimeEnd).add(event.eventDurationInMinutes, 'minutes');
      const isToLateForFinish = finishTime.isAfter(moment());
      if ((isTooLateForStart && !isSomeonePending) || isToLateForFinish) {
        return Statuses.finished;
      }
      return Statuses.pending;
    }
    const maxPoints = event.questions.map(quest => quest.points).reduce((a, b) => a + b, 0);
    return {
      date: event.date,
      name: event.name,
      status: getQuizStatus(),
      startTime: event.startTime,
      subject: event.subject,
      maxPoints: maxPoints,
      members: event.members.map(memberData => ({
        email: memberData.email,
        status: memberData.status,
        points: memberData.pointsSummary,
        answers: memberData.answers.map(answer => ({
          question: answer.question,
          answer: answer.answer,
          correctAnswer: answer.correctAnswer,
          points: answer.points,
        })),
      }))
    }
  });

  res.send(preparedEvents.reverse());
}
