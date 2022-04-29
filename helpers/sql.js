const { BadRequestError } = require("../expressError");

//  Helper for making selective update queries.
//  The calling function can use it to make the SET clause of an SQL UPDATE
//  statement.
//  @param dataToUpdate {Object} {field1: newVal, field2: newVal, ...}
//  @returns {Object} {sqlSetCols, dataToUpdate}

//  @example {max_streak: 12, current_streak: 5} =>
//  { setCols: '"max_streak"=$1, "current_streak"=$2',
//  values: [12, 5] }

function sqlForPartialUpdate(dataToUpdate) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

//  {max_streak: 12, current_streak: 5} =>
//  { setCols: '"max_streak"=$1, "current_streak"=$2',
//  values: [12, 5] }

  const cols = keys.map((colName, idx) =>
      `"${colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };