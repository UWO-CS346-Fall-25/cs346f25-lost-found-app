const fetch = require("node-fetch").default;


const buildingNameMap = {
  Sage: "Sage Hall",
  Halsey: "Halsey Science Center",
  Polk: "Polk Library",
  Swart: "Swart Hall",
  Reeve: "Reeve Memorial Union",
  Rec: "Student Recreation and Wellness Center"
};

/**
 * Grabs the hours for the next three days of the building that is inputted
 * @param {*} buildingName - Name of building you wish to receive the hours for
 * @returns - Hours that the building is open for the next three days.
 */
async function getBuildingHours(buildingName) {
  console.log("Starting call to Google Places API, buildingHoursController, Timestamp: ", Date.now());
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const queryName = buildingNameMap[buildingName] || buildingName;

    const searchUrl =
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        queryName + " UW Oshkosh"
      )}&key=${apiKey}`;

    const searchRes = await fetch(searchUrl);
    const searchJson = await searchRes.json();

    if (!searchJson.results || searchJson.results.length === 0) {
      return { hours: null, status: "Place not found" };
    }

    const placeId = searchJson.results[0].place_id;

    const detailsUrl =
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,opening_hours&key=${apiKey}`;

    const detailsRes = await fetch(detailsUrl);
    const detailsJson = await detailsRes.json();

    const hoursObj = detailsJson.result?.opening_hours;

    if (!hoursObj || !hoursObj.weekday_text) {
      return { hours: null, status: "No hours available" };
    }

    const allDays = hoursObj.weekday_text; 
    const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


    const todayName = WEEKDAYS[new Date().getDay()];


    let startIndex = allDays.findIndex(line => line.startsWith(todayName));


    if (startIndex === -1) startIndex = 0;

    //Limits results to only the next three days.  Looks better in UI to display only 3 values rather than 7.
    const nextThree = [];
    for (let i = 0; i < 3 && i < allDays.length; i++) {
      const idx = (startIndex + i) % allDays.length;
      nextThree.push(allDays[idx]);
    }
    
    return {
      hours: nextThree,
      status: "OK"
    };


  } catch (err) {
    console.error("Issue while calling Google API, buildingHoursController error: ", err, " TimeStamp: ", Date.now());
    return { hours: null, status: "API error" };
  }
}

module.exports = { getBuildingHours };
