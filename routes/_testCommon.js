"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Habit = require("../models/habit");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  await db.query("DELETE FROM users");

  await User.register({
    username: "user1",
    password: "password1",
    isAdmin: false,
  });

  await User.register({
    username: "user2",
    password: "password2",
    isAdmin: false,
  });

  await Habit.create({
      title: "Yoga",
      habit_description: "10min yoga routine",
      streak_target: 24,
      username: 'user1',
      max_streak: 0,
      attempt: 1,
      current_counter: 0, 
      last_checked: new Date(2022,4,13)
  })
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const user1Token = createToken({ username: "user1", isAdmin: false });
const user2Token = createToken({ username: "user2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  user1Token,
  user2Token,
  adminToken,
};