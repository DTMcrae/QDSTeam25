//preload images so it doesn't flicker
var imageUrls = [
  "../images/meatW.png",
  "../images/soccerW.png",
  "../images/SpeakerD.png",
  "../images/SpeakerW.png",
  "../images/SpeakerDOff.png",
  "../images/SpeakerWOff.png",
  "../images/moon.png",
];

var images = [];
imageUrls.forEach(function (url) {
  var img = new Image();
  img.src = url;
  images.push(img);
});

// Initialize app in light mode
var darkMode = false;

function updateStyles(darkMode) {
  var phoneBackground = document.getElementById("phone-container");
  var logo = document.getElementById("logo");
  var menu = document.getElementById("menu");
  if (darkMode) {
    phoneBackground.style.backgroundImage = "url(/images/dark-background.png)";
    phoneBackground.style.color = "#DDDDDD";
    logo.style.color = "#DDDDDD";
    menu.style.backgroundImage = "url(/images/light-menu.png)";
  } else {
    phoneBackground.style.backgroundImage = "url(/images/light-background.png)";
    phoneBackground.style.color = "#354449";
    logo.style.color = "#354449";
    menu.style.backgroundImage = "url(/images/dark-menu.png)";
  }
}

//MUSIC TOGGLE
var musicPlayer = document.querySelector('.speaker input[type="checkbox"]');
const songs = ["audio/music1.mp3", "audio/music2.mp3", "audio/music3.mp3"];
let currentSongIndex = 0;

let audio = new Audio(songs[currentSongIndex]);

// Function to play the next song
function playNextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  audio.src = songs[currentSongIndex];
  audio.play();
}

// Event listener for the ended event, to play the next song
audio.addEventListener("ended", playNextSong);

function updateSpeakerImage(playing, lightsOff) {
  var speaker = document.querySelector(".speaker");
  if (playing) {
    if (lightsOff) {
      speaker.style.backgroundImage = "url('../images/SpeakerW.png')";
    } else {
      speaker.style.backgroundImage = "url('../images/SpeakerD.png')";
    }
  } else {
    //not playing
    if (lightsOff) {
      speaker.style.backgroundImage = "url('../images/SpeakerWOff.png')";
    } else {
      speaker.style.backgroundImage = "url('../images/SpeakerDOff.png')";
    }
  }
}
// Event listener for the musicPlayer checkbox
musicPlayer.addEventListener("change", function () {
  if (musicPlayer.checked) {
    audio.play();
    updateSpeakerImage(true, toggle.checked);
  } else {
    audio.pause();
    updateSpeakerImage(false, toggle.checked);
  }
});

//feed pet request
const feedButton = document.getElementById("feedButton");
feedButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/eat");
    const data = await response.json();
    console.log(data); // Log the response from the API
    updateDisplay();
  } catch (error) {
    console.error("Error:", error);
  }
});

//play pet request
const playButton = document.getElementById("playButton");
playButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/play");
    const data = await response.json();
    console.log(data); // Log the response from the API
    updateDisplay();
  } catch (error) {
    console.error("Error:", error);
  }
});

//SLEEPING TOGGLE
var toggle = document.querySelector('.switch input[type="checkbox"]');
toggle.addEventListener("change", toggleTheme);

function toggleTheme() {
  darkMode = !darkMode;
  updateStyles(darkMode);

  //change LIGHTS text
  lightsText.innerHTML = toggle.checked
    ? "Lights &nbsp;&nbsp;&nbsp;&nbsp;On"
    : "Lights &nbsp;&nbsp;&nbsp;Out";

  // Select the sleeping box container
  var sleepingBoxContainer = document.querySelector(".sleeping-box");

  // Toggle the visibility of the sleeping box based on the toggle state
  sleepingBoxContainer.style.visibility = toggle.checked ? "visible" : "hidden";

  // Select the speaker element
  var speaker = document.querySelector(".speaker");
  updateSpeakerImage(musicPlayer.checked, toggle.checked);

  //toggle meat icon
  var meat = document.querySelector(".feed");
  meat.style.backgroundImage = toggle.checked
    ? "url('../images/meatW.png')"
    : "url('../images/meat.png')";

  //toggle soccer icon
  var soccer = document.querySelector(".play");
  soccer.style.backgroundImage = toggle.checked
    ? "url('../images/soccerW.png')"
    : "url('../images/soccer.png')";

    fetch("/api/asleep/?asleep=" + !toggle);
}

async function sleepState() {
    const rest = await fetch("/api/asleep");
    const awake = await rest.json();
    console.log(awake);
    if(awake.asleep)
    {
        toggle.checked = true;
        toggleTheme();
    }
}
sleepState()
