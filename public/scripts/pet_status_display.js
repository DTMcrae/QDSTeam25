const redRange = 25;
const yellowRange = 50;

//Updates the hunger,energy, and happiness bar using the pet's current stats.
async function updateDisplay() {
  //Get the stats from the server.
  const response = await fetch(`/api/stats`);
  var stats = await response.json();

  //Hunger
  updateColours("hunger", stats[0]);
  document.getElementById("hunger").style.width = stats[0] + "%";
  //Energy
  updateColours("energy", stats[1]);
  document.getElementById("energy").style.width = stats[1] + "%";
  //Happiness
  updateColours("happiness", stats[2]);
  document.getElementById("happiness").style.width = stats[2] + "%";
}

//Updates the colour of the specified bar.
function updateColours(id, newVal) {
  var doc = document.getElementById(id);
  var oldVal = Number(doc.style.width.substring(0, doc.style.width.length - 1));
  if (doc.classList.contains(petCondition(oldVal))) {
    doc.classList.remove(petCondition(oldVal));
  }
  doc.classList.add(petCondition(newVal));
}

//Determine what "condition" a given value is in.
function petCondition(value) {
  if (value <= redRange) return "bad";
  else if (value <= yellowRange) return "moderate";
  else return "good";
}

//Updates the display upon loading the page.
updateDisplay();
