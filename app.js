// This is a pure API app, taking values from the query string (GET requests) 
// or from a JSON body (other requests). It returns JSON.
// This gets authentication/authorization with JWT tokens. 

"use strict";

// Express app for good-habits
////////////////////////////////////////////////

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const habitsRoutes = require("./routes/habits");

// use external logger:
const morgan = require("morgan");

const app = express();

app.use(cors());

// Parse request bodies for JSON
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// import a logger
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/habits", habitsRoutes);


// 404 errors handler
app.use(function (req, res, next) {
  return next(new NotFoundError());
});


// Generic error handler; anything unhandled goes here,
// matchs every HTTP verb and path
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  
  // the default status is 500 Internal Server Error
  const status = err.status || 500;
  const message = err.message;
  
  // set the status and alert the user
  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;