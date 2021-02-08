const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const router = require('./routes/index');

const connectionParams = {
  useUnifiedTopology: true,
  useNewUrlParser: true
};

const uri = 'mongodb+srv://user1:12345@quizes.qqay2.mongodb.net/twij?retryWrites=true&w=majority';

console.log('Connecting database...')
mongoose.connect(uri, connectionParams)
  .then( () => {
    console.log('Connected to database ')
  })
  .catch( (err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(router);

const port = process.env.PORT || 3025;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
