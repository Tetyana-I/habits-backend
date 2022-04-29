"use strict";

const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Habit = require("./habit.js");
const {
  commonBeforeAll,  
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testUsernames,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


// create habit
//////////////////////////////////////

describe("create habit", function () {
  
    test("works", async function () {
        let newHabit = {
            title: "Exercise",
            habit_description: "walking 30 min, abs routine 15min, yoga 10min",
            streak_target: 24,
            username: testUsernames[0],
            max_streak: 0,
            attempt: 1,
            current_counter: 0, 
            last_checked: new Date(2022,4,13) 
        };  
        let habit = await Habit.create(newHabit);
        expect(habit).toEqual({
        ...newHabit,
        id: expect.any(Number),
        });
    });
});


// get by id
////////////////////////////////////////

describe("get by id", function () {
    test("works", async function () {
        let  habitInDb = await Habit.create(
            {
                title: "Exercise",
                habit_description: "walking 30 min, abs routine 15min, yoga 10min",
                streak_target: 24,
                username: testUsernames[0],
                max_streak: 0,
                attempt: 1,
                current_counter: 0, 
                last_checked: new Date(2022,4,13) 
            }
        ); 
        let habit = await Habit.get(testUsernames[0], habitInDb.id);
        expect(habit).toEqual({
            id: habitInDb.id,  
            title: "Exercise",
            habit_description: "walking 30 min, abs routine 15min, yoga 10min",
            streak_target: 24,
            username: testUsernames[0],
            max_streak: 0,
            attempt: 1,
            current_counter: 0, 
            last_checked: new Date(2022,4,13) 
        });
    });
  
    test("not found if no such habit", async function () {
        try {
            await Habit.get(testUsernames[0], 0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
  });


//   remove
///////////////////////////////////////////

describe("remove", function () {
    test("works", async function () {
        let  habitInDb = await Habit.create(
            {
                title: "Exercise",
                habit_description: "walking 30 min, abs routine 15min, yoga 10min",
                streak_target: 24,
                username: testUsernames[0],
                max_streak: 0,
                attempt: 1,
                current_counter: 0, 
                last_checked: new Date(2022,4,13) 
                }
            ); 
        let habit = await Habit.get(testUsernames[0], habitInDb.id);
        
        let res = await db.query(
            "SELECT id FROM habits WHERE id=$1", [habit.id]);
        expect(res.rows.length).toEqual(1);

        await Habit.remove(habit.id);
        res = await db.query(
            "SELECT id FROM habits WHERE id=$1", [habit.id]);
        expect(res.rows.length).toEqual(0);
    });
  
    test("not found if no such habit", async function () {
        try {
            await Habit.remove(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
  });


// update
/////////////////////////////////////////////////////////

describe("update", function () {
    test("works", async function () {
        let  habitInDb = await Habit.create(
            {
                title: "Drink Water",
                habit_description: "2 glasses",
                streak_target: 24,
                username: testUsernames[0],
                max_streak: 0,
                attempt: 1,
                current_counter: 0, 
                last_checked: new Date(2022,4,13) 
                }
            ); 
    
        let updateData = {
          title: "morning exercises",
          max_streak: 12,
        };  

        let habit = await Habit.update(habitInDb.id, updateData);
        expect(habit).toEqual({
            id: habitInDb.id,
            title: "morning exercises",
            habit_description: "2 glasses",
            streak_target: 24,
            username: testUsernames[0],
            max_streak: 12,
            attempt: 1,
            current_counter: 0, 
            last_checked: new Date(2022,4,13) 
        });
    });
  
    test("not found if no such habit", async function () {
      try {
        await Habit.update(0, {
          title: "test",
        });
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });


//  find all habits by username
///////////////////////////////////////////

describe("findAll", function () {
    test("works", async function () {
      let habits = await Habit.findAllByUsername(testUsernames[0]);
      expect(habits).toEqual([]);
    });

}); 