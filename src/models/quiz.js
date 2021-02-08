const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  date: String,
  subject: String,
  questions: [{
    question: String,
    answerA: String,
    answerB: String,
    answerC: String,
    answerD: String,
    answer: Number,
    points: Number
  }]
});

module.exports = mongoose.model('Quiz', quizSchema);
