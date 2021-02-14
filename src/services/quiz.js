const mongoose = require('mongoose');
const Quiz = require('../models/quiz');

exports.getQuizzes = async () => {
  return Quiz.find();
}

exports.getQuiz = (id) => {
  return Quiz.findById(id);
}

exports.createQuiz = async (quiz) => {
  const newQuiz = new Quiz({
    _id: new mongoose.Types.ObjectId(),
    date: new Date().toISOString().slice(0,10),
    name: quiz.name,
    subject: quiz.subject,
    questions: quiz.questions.map(quest => ({
      _id: new mongoose.Types.ObjectId(),
      ...quest,
    }))
  });
  await newQuiz.save();
}

exports.updateQuiz = (quiz) => {
  return Quiz.findByIdAndUpdate(quiz.id, {
    name: quiz.name,
    subject: quiz.subject,
    questions: quiz.questions
  });
}

exports.removeQuiz = (id) => {
  return Quiz.findOneAndDelete(id);
}
