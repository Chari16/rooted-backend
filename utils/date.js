const { WEEKEND_TYPE } = require("../enums");

function checkHoliday(dateString, type) {
  let date = new Date(dateString);

  if (date.getDay() !== 6) {
    // Ensure the date is a Saturday
    return "Not a Saturday";
  }

  let year = date.getFullYear();
  let month = date.getMonth(); // Get month (0-based)

  let count = 0; // Track Saturday index
  let checkDate = new Date(Date.UTC(year, month, 1)); // Start from the 1st of the month
  console.log(" dateString  ", date);
  console.log(" checkDate ", checkDate);
	let saturdays = []
  while (checkDate.getMonth() === month) {
    if (checkDate.getDay() === 6) {
      // Check if it's a Saturday
      count++;
			saturdays.push({ date: checkDate.toISOString().split("T")[0], count })
			console.log(" checkDate ", checkDate.toISOString().split("T")[0]);
      // if (checkDate.toISOString().split("T")[0] === dateString) {
      //   return count % 2 === 1 ? "ODD" : "EVEN";
      // }
			console.log("count == ", count)
    }
    checkDate.setDate(checkDate.getDate() + 1); // Move to next day
  }

	console.log(" saturdays ", saturdays)

	// check the index at which the date is present
	const saturdayIndex = saturdays.filter((day) => day.date === dateString)[0]
	console.log(" saturdayIndex ", saturdayIndex)
	if(type === WEEKEND_TYPE.ODD) {
		if(saturdayIndex.count === 1 || saturdayIndex.count === 3) { 
			return true
		}
		else return false;
	}
	if(type === WEEKEND_TYPE.EVEN) {
		if(saturdayIndex.count === 2 || saturdayIndex.count === 4) { 
			return true
		}
		else return false;
	}
}


module.exports = {
  checkHoliday,
};
