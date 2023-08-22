require('dotenv').config();
require('express-async-errors');

const express = require("express");
const path = require("path");

const app = express();

const connectDB = require('./db/connectdb');

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = 3000;

// routers section
const userRouter = require('./routes/userRouter');
const recipeRouter = require('./routes/recipeRouter');
const collectionRouter = require('./routes/collectionRouter');

app.use("/build", express.static(path.join(__dirname, "../build")));

app.use('/api/user', userRouter);
app.use('/api/recipe', recipeRouter);
app.use('/api/collection', collectionRouter);


//global error handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: "Express error handler caught unknown middleware error",
    status: 400,
    message: { err: "An error occurred" },
  };
  const error = Object.assign({}, defaultErr, err);
  console.log(error.log);

  res.status(error.status).json(error.message);
});


const start = async () => {
  try {
    await connectDB('mongodb+srv://mkymn10:m0ng03xpRpract1ce.@nodeexpressprojects.jjitmcc.mongodb.net/MacroCalco-DB?retryWrites=true&w=majority');
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}...`);
    });
  } catch (error) {
    console.log('Error in starting app:', error);
  }
};

start();

module.exports = app;
