"use strict";

// Routes for habits

const jsonschema = require("jsonschema");
const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
const Habit = require("../models/habit");
const habitNewSchema = require("../schemas/habitNew.json");
const habitUpdateSchema = require("../schemas/habitUpdate.json");

const router = express.Router({ mergeParams: true });


// POST / { habit } => { habit }
//  habit should be { title, habit_description, streak_target, username, max_streak, attempt, current_counter, last_checked }
//  Returns { id, username, title, habit_description, streak_target, max_streak, attempt, current_counter, last_checked }
//  Authorization required: admin or current user

router.post("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, habitNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const habit = await Habit.create(req.body);
    return res.status(201).json({ habit });
  } catch (err) {
    return next(err);
  }
});

// GET /[username]/[habitId] => { habit }
//  Returns { id, username, title, habit_description, streak_target, max_streak, attempt, current_counter, last_checked }
//  Authorization required: admin or correct user

router.get("/:username/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const habit = await Habit.get( req.params.username, req.params.id);
    return res.json({ habit });
  } catch (err) {
    return next(err);
  }
});

// PATCH /[username]/[habitId] { fld1, fld2, ... } => { habit }
//   Data can include: { title, habit_description, streak_target, max_streak, attempt, current_counter, last_checked  }
//   Returns { id, username, title, habit_description, streak_target, max_streak, attempt, current_counter, last_checked }
//   Authorization required: admin or correct user

router.patch("/:username/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, habitUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const habit = await Habit.update(req.params.id, req.body);
    return res.json({ habit });
  } catch (err) {
    return next(err);
  }
});

// PATCH /[username]/[habitId]/checked  { fld1, fld2, ... } => { habit }
//   Data can include: { last_checked  }
//   Returns { id, username, title, habit_description, streak_target, max_streak, attempt, current_counter, last_checked }
//   Authorization required: admin or correct user

router.patch("/:username/:id/checked", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, habitUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const habit = await Habit.checkHabit(req.params.id, req.params.username, req.body);
    return res.json({ habit });
  } catch (err) {
    return next(err);
  }
});


// DELETE /[handle]  =>  { deleted: id }
//  Authorization required: admin or correct user

router.delete("/:username/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await Habit.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;