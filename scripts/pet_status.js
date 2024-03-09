const hungerDecayRate = 3.5;
const energyDecayRate = 3;
const sleepRestoreRate = 5;
const happinessDecayRate = 3.25;

//Returns the current date and time as a string formatted to match mySQL's datetime format.
function getDateStr() {
    var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    return date;
}

//Returns the number of hours between date1, and date 2.
function hoursPassed(date1, date2) {
    //Calculate the difference in milliseconds
    var diff = (date2.getTime() - date1.getTime())/1000;
    //Conversion to hours
    diff /= (60 * 60);
    //Returns the absolute value, in case date1 is larger than date2.
    return Math.abs(Math.round(diff));
}

/*
Returns an array of the pet's current stats after modification.
Index 0: Hunger
Index 1: Energy
Index 2: Happiness
*/
function calculateStats() {
    //Temp last login var
    var last_login = new Date(year=2024,monthIndex=2,date=8,hours=22,minutes=15);
    var hours = hoursPassed(last_login,new Date(getDateStr()));
    console.log("Hours passed: " + hours);
    return [
        determineHunger(hours),
        determineEnergy(hours),
        determineHappiness(hours)
        ]
}

// Calculates the pet's happiness after the given hours have passed.
function determineHappiness(hoursPassed) {
    var currentHappiness = 100;
    return Math.round(currentHappiness - (hoursPassed * happinessDecayRate));
}

// Calculates the pet's hunger after the given hours have passed.
function determineHunger(hoursPassed) {
    var currentHunger = 100;
    return Math.round(currentHunger - (hoursPassed * hungerDecayRate));
}

// Calculates the pet's energy after the given hours have passed.
function determineEnergy(hoursPassed) {
    var currentEnergy = 75;
    var asleep = false;
    if(asleep) {
        return currentEnergy + (hoursPassed * sleepRestoreRate);
    }
    return Math.round(currentEnergy - (hoursPassed * energyDecayRate));
}

module.exports = {
    getDateStr,
   calculateStats,
   hoursPassed,
   determineEnergy,
   determineHappiness,
   determineHunger
}