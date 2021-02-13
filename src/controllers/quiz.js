const services = require('../services/quiz');

exports.getQuizzes = async (req, res) => {
  const quizzes = await services.getQuizzes();
  res.send({
    quizzes: quizzes.map((quiz) => {
      return {
        id: quiz._id,
        name: quiz.name,
        date: quiz.date,
        subject: quiz.subject,
        questionsCount: quiz.questions.length
      }
    })
  });
}

exports.getQuiz = async (req, res) => {
  const id = req.query.id;
  const quiz = await services.getQuiz(id);
  res.send({
    quiz: {
      id: quiz._id,
      name: quiz.name,
      subject: quiz.subject,
      questions: quiz.questions.map(quest => ({
        id: quest._id,
        question: quest.question,
        answerA: quest.answerA,
        answerB: quest.answerB,
        answerC: quest.answerC,
        answerD: quest.answerD,
        answer: quest.answer,
        points: quest.points,
      })),
    }
  });
}

exports.removeQuiz = async (req, res) => {
  const id = req.query.id;
  await services.removeQuiz(id);
  res.sendStatus(200);
}

exports.updateQuiz = async (req, res) => {
  const quiz = req.body.quiz;
  if (quiz.id) {
    await services.updateQuiz(quiz);
  } else {
    await services.createQuiz(quiz);
  }
  res.sendStatus(200);
}
