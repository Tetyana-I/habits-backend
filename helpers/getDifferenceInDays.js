// returns difference between two dates in days
// date1, date2 format example: new Date("07/02/2019");

function getDifferenceInDays(date1, date2) {
    let dt2 = new Date(date2);
    // To calculate the time difference of two dates
    let differenceInTime = dt2.getTime() - date1.getTime();
  
    // To calculate the number of days between two dates
    let differenceInDays = differenceInTime / (1000 * 3600 * 24);
  
    return differenceInDays;
  }

module.exports = { getDifferenceInDays };

