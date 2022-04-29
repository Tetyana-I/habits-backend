"use strict";

const db = require("../db");
const { NotFoundError} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { getDifferenceInDays } = require("../helpers/getDifferenceInDays");

//////////////////////////////////////////////////
// Related functions for habits.
//////////////////////////////////////////////////

class Habit {
// Create a habit (from data), update db, return new habit data.
//  data should be { title, habit_description, streak_target, username, max_streak, attempt, current_counter, last_checked }
// Returns { id, username, title, habit_description, streak_target, max_streak, attempt, current_counter, last_checked }


  static async create(data) {

    const result = await db.query(
          `INSERT INTO habits (title,
                             habit_description,
                             streak_target, 
                             username,
                             max_streak,
                             attempt,
                             current_counter,
                             last_checked)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id,
                    username,
                    title, 
                    habit_description,
                    streak_target,
                    max_streak,
                    attempt,
                    current_counter,
                    last_checked`,
        [
          data.title,
          data.habit_description,
          data.streak_target,
          data.username,
          data.max_streak,
          data.attempt,
          data.current_counter,
          data.last_checked,
        ]);
    let habit = result.rows[0];

    return habit;
  }

  
//   Given a habit id and username, return data for this habit.
//     Returns { id,  username, title, habit_description,
//              streak_target, max_streak, attempt, current_counter, last_checked }
//     Throws NotFoundError if not found.

static async get(username, id) {
    const habitRes = await db.query(
          `SELECT id,
                  username,
                  title,
                  habit_description,
                  streak_target,
                  max_streak,
                  attempt,
                  current_counter,
                  last_checked
           FROM habits
           WHERE username=$1 AND id = $2`, [username, id]);

    const habit = habitRes.rows[0];
    if (!habit) throw new NotFoundError(`No habit: ${id}`);

    return habit;
  }


//  Delete given habit from database; returns undefined.
//  Throws NotFoundError if a habit not found.

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM habits
           WHERE id = $1
           RETURNING id`, [id]);
    const habit = result.rows[0];

    if (!habit) throw new NotFoundError(`No habit: ${id}`);
  }


//  Find all habits by username
//  Returns [{ id, username, title, habit_description, streak_target,
//             max_streak, attempt, current_counter, last_checked }, ...]


  static async findAllByUsername(username) {
    let habitsRes = await db.query(
        `SELECT id,
                username,
                title,
                habit_description,
                streak_target,
                max_streak,
                attempt,
                current_counter,
                last_checked
         FROM habits
        WHERE username = $1`, [username]);
    return habitsRes.rows;
  }


//  Update habit data with `data`.
//  Data can include: 
//  { title, habit_description, streak_target, max_streak, attempt,  current_counter, last_checked } 
//  Returns habit Object
//  Throws NotFoundError if not found.

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data);
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE habits 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                username,
                                title, 
                                habit_description, 
                                streak_target,
                                max_streak,
                                attempt,
                                current_counter,
                                last_checked`;
    const result = await db.query(querySql, [...values, id]);
    const habit = result.rows[0];

    if (!habit) throw new NotFoundError(`No habit: ${id}`);
    return habit;
  }

  //  Check a habit
  //  Data includes: { last_checked } 
  // 1. checks if difference between today's date and last_checked is no more than 1 day
  // 2. if diff is more than 1  => attempt++, current_counter = 1
  //    if diff less or equal 1 day: current_counter++, if max_streak < current_counter => max_streak = current_counter
  // 3. change last_checked and return updated habit
  //  Returns habit Object
  //  Throws NotFoundError if not found.

  static async checkHabit(id, username, data) {
    let result;
    let habit = await this.get(username, id);
    let diffInDays = getDifferenceInDays(habit.last_checked, data.last_checked);
    console.log("difference in days", diffInDays);
    // if a habit is new and streak didn't start
    if (habit.max_streak === 0){
      console.log("===> step 0");
        result = await this.update(id, {
        attempt: habit.attempt+1,
        current_counter: 1,
        max_streak: 1,
        last_checked: data.last_checked
      });
      return result;
    }
    // if streak was failed (a user missed a day), and a new attempt should started
    if (diffInDays > 1) {
      console.log("===> step 1");
        result = await this.update(id, {
        attempt: habit.attempt+1,
        current_counter: 1,
        last_checked: data.last_checked
      });
    // if current streak is bigger than previous best result for this habit
    } else if (habit.max_streak < habit.current_counter+1) {
      console.log("===> step 2");
        result = await this.update(id, {
        current_counter: habit.current_counter+1,
        max_streak: habit.current_counter+1,
        last_checked: data.last_checked
      });
      } else {
        console.log("===> step 3");
          result = await this.update(id, {
          current_counter: habit.current_counter+1,
          last_checked: data.last_checked
        });
    }
    return result;
  }
}

module.exports = Habit;