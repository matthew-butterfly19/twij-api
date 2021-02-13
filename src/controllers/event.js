const services = require('../services/event');

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

}
