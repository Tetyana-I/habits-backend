"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  user1Token,
  user2Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


// POST /users (only for admins)
/////////////////////////////////////////

describe("POST /users", function () {
  test("works for admins: create non-admin", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          password: "password-new",
          isAdmin: false,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        isAdmin: false,
      }, token: expect.any(String),
    });
  });

  test("works for admins: create admin", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          password: "password-new",
          isAdmin: true,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        isAdmin: true,
      }, token: expect.any(String),
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          password: "password-new",
          isAdmin: true,
        })
        .set("authorization", `Bearer ${user1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          password: "password-new",
          isAdmin: true,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          password: "p",
          isAdmin: true,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});


// GET /users (only for admins)
/////////////////////////////////////////////////////

describe("GET /users", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      users: [
        {
          username: "user1",
          isAdmin: false,
        },
        {
          username: "user2",
          isAdmin: false,
        },
      ],
    });
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${user1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get("/users");
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. 
    // This is an incorrect example that should cause an error
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
        .get("/users")
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});


// GET /users/:username 
////////////////////////////////////////////////

describe("GET /users/:username", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .get(`/users/user1`)
        .set("authorization", `Bearer ${user1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "user1",
        isAdmin: false,
        habits: [{
          id: expect.any(Number), 
          title: "Yoga",
          habit_description: "10min yoga routine",
          streak_target: 24,
          username: 'user1',
          max_streak: 0,
          attempt: 1,
          current_counter: 0, 
          last_checked: new Date(2022,4,13).toISOString()
        }],
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
        .get(`/users/user2`)
        .set("authorization", `Bearer ${user2Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "user2",
        isAdmin: false,
        habits: []
      },
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
        .get(`/users/u1`)
        .set("authorization", `Bearer ${user2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get(`/users/user1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
        .get(`/users/nope`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});


// PATCH /users/:username 
///////////////////////////////////////////////////////////////

describe("PATCH /users/:username", () => {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/users/user1`)
        .send({
          password: "New-password"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "user1",
        isAdmin: false,
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
        .patch(`/users/user1`)
        .send({
          password: "updated_password",
        })
        .set("authorization", `Bearer ${user1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "user1",
        isAdmin: false,
      },
    });
    const isSuccessful = await User.authenticate("user1", "updated_password");
    expect(isSuccessful).toBeTruthy();
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
        .patch(`/users/user1`)
        .send({
          password: "newPassword",
        })
        .set("authorization", `Bearer ${user2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/users/user1`)
        .send({
          password: "updated",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such user", async function () {
    const resp = await request(app)
        .patch(`/users/nope`)
        .send({
          password: "updated",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
        .patch(`/users/user1`)
        .send({
          password: 2,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});


// DELETE /users/:username 
////////////////////////////////////////////////////////////

describe("DELETE /users/:username", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/users/user1`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "user1" });
  });

  test("works for same user", async function () {
    const resp = await request(app)
        .delete(`/users/user1`)
        .set("authorization", `Bearer ${user1Token}`);
    expect(resp.body).toEqual({ deleted: "user1" });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
        .delete(`/users/user1`)
        .set("authorization", `Bearer ${user2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/users/user1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
        .delete(`/users/nope`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
