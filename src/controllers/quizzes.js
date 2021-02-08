const services = require('../services/quizzes');

exports.getQuizzes = async (req, res) => {
  const quizzes = await services.getQuizzes();
  console.log(quizzes);
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
      questions: quiz.questions
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
