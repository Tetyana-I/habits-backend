const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testUsernames = [];

async function commonBeforeAll() {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM habits");
    
    let res = await db.query(`INSERT INTO users(username, password)
            VALUES ('u1', $1), ('u2', $2)
            RETURNING username`,
            [
                await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
                await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
            ]);
    
    testUsernames.push(res.rows[0].username);
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


module.exports = {
  commonBeforeAll,  
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testUsernames,
};