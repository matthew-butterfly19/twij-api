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

const quizSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  date: String,
  subject: String,
  questions: [questionSchema],
});

module.exports = mongoose.model('Quiz', quizSchema);
