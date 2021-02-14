const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Quiz = require('../models/quiz');
const Event = require('../models/event');
const jwt = require('jsonwebtoken');

const secretKey = `æÓqÍ¶A@1¡åÕöÍÛËãûvû5ql´K¾Àk½¸tò§DH;±v:-ëI¼K÷SD½÷«|]úé7ÖOøù%ÿÛD0vá*ÒÄº]õ¡ðI¥ÿRî>¤]ÈqQÓ·»Â?èÀMj²}¯/ôTù¯jHiãoy«~Fw)â¨çO15t¡dÂeÎ[Ô`;
exports.secretKey = secretKey;
const baseUri = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? 'http://localhost:3000' : 'https://twij-api.herokuapp.com';

exports.scheduleTest = async (newTest) => {
  const quiz = await Quiz.findById(newTest.quizId);
  const eventId = new mongoose.Types.ObjectId();
  const event = new Event({
    _id: eventId,
    date: new Date().toISOString().slice(0,10),
    name: quiz.name,
    subject: quiz.subject,
    startTime: newTest.startTime,
    startTimeEnd: newTest.startTimeEnd,
    eventDurationInMinutes: newTest.eventDurationInMinutes,
    quizId: newTest.quizId,
    emailMessage: newTest.emailMessage,
    questions: quiz.questions.filter(quest => newTest.questionsIds.includes(String(quest._id))),
    members: newTest.emails.map(email => {
      return {
        _id: new mongoose.Types.ObjectId(),
        email,
        status: 'Awaiting',
        timeStart: '',
        timeEnd: '',
        pointsSummary: 0,
        answers: [],
      };
    }),
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'quiz.twij@gmail.com',
      pass: '23agcw7e'
    }
  });

  const emailsOptions = newTest.emails.map(email => {
    const token = jwt.sign({
      eventId,
      email,
    }, secretKey);
    const stringToken = decodeURIComponent(token);
    const link = `${baseUri}/${stringToken}`;

    return {
      from: 'quiz.twij@gmail.com',
        to: email,
      subject: `Zaproszenie na Test ${quiz.name} z przedmiotu ${quiz.subject}`,
      html: `
      <p>${newTest.emailMessage}</p>
      <p>Data rozpoczęcia quizu: <b>${newTest.startTime.substring(0, 10)} ${newTest.startTime.substring(11, 19)}</b></p>
      <p>Czas trwania quizu: <b>${newTest.eventDurationInMinutes} minut</b></p>
      <p>Aby rozpocząć quiz wybierz link poniżej</p>
      <h2><a href="${link}">Link do quizu</a></h2>
    `,
    }
  });

  const sendingEmailsPromises = emailsOptions.map(mailOptions => {
    return transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
  })
  await Promise.all(sendingEmailsPromises);
  await event.save();
}
