const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("works: update 1 item", function () {
    const result = sqlForPartialUpdate({ f1: "v1" });
    expect(result).toEqual({
      setCols: "\"f1\"=$1",
      values: ["v1"],
    });
  });

  test("works: update 2 items", function () {
    const result = sqlForPartialUpdate({ f1: "v1", f2: "v2" });
    expect(result).toEqual({
      setCols: "\"f1\"=$1, \"f2\"=$2",
      values: ["v1", "v2"],
    });
  });
});