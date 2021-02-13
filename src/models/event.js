const mongoose = require('mongoose');

const questionSchema = {
  _id: mongoose.Schema.Types.ObjectId,
  question: String,
  answerA: String,
  answerB: String,
  answerC: String,
  answerD: String,
  answer: Number,
  points: Number
};

const eventSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  date: String,
  name: String,
  subject: String,
  startTime: String,
  startTimeEnd: String,
  eventDurationInMinutes: Number,
  quizId: String,
  questions: [questionSchema],
  emailMessage: String,
  members: [{
    _id: mongoose.Schema.Types.ObjectId,
    email: String,
    status: String,
    timeStart: String,
    timeEnd: String,
    pointsSummary: Number,
    answers: [{
      _id: mongoose.Schema.Types.ObjectId,
      questionId: String,
      question: String,
      answer: String,
      points: Number,
      correctAnswer: String,
      correctAnswerPoints: Number,
    }],
  }]
});

module.exports = mongoose.model('Event', eventSchema);
