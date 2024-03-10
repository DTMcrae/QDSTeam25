
//preload images so it doesn't flicker
var imageUrls = [
    '../images/meatW.png',
    '../images/soccerW.png',
    '../images/SpeakerD.png',
    '../images/SpeakerW.png',
    '../images/SpeakerDOff.png',
    '../images/SpeakerWOff.png',
    '../images/moon.png',
];

var images = [];
imageUrls.forEach(function (url) {
    var img = new Image();
    img.src = url;
    images.push(img);
});


//SLEEPING TOGGLE
var toggle = document.querySelector('.switch input[type="checkbox"]');
toggle.addEventListener('change', function () {
    document.body.classList.toggle('dark');
    // Select the element
    var studopetElement = document.querySelector('.studopet');

    // Add a class to the element
    studopetElement.classList.toggle('dark');

    //change LIGHTS text
    lightsText.textContent = toggle.checked ? 'Lights On' : 'Lights Out';

    // Select the sleeping box container
    var sleepingBoxContainer = document.querySelector('.sleeping-box');

    //change text
    lightsText.textContent = toggle.checked ? 'Lights On' : 'Lights Out';

    // Toggle the visibility of the sleeping box based on the toggle state
    sleepingBoxContainer.style.visibility = toggle.checked ? 'visible' : 'hidden';

    // Select the speaker element
    var speaker = document.querySelector('.speaker');
    console.log(toggle.checked)
    updateSpeakerImage(musicPlayer.checked, toggle.checked)

    //toggle meat icon
    var meat = document.querySelector('.feed')
    meat.style.backgroundImage = toggle.checked ? 'url(\'../images/meatW.png\')' : 'url(\'../images/meat.png\')';

    //toggle soccer icon
    var soccer = document.querySelector('.play')
    soccer.style.backgroundImage = toggle.checked ? 'url(\'../images/soccerW.png\')' : 'url(\'../images/soccer.png\')';
});

//MUSIC TOGGLE
var musicPlayer = document.querySelector('.speaker input[type="checkbox"]');
const songs = ['audio/music1.mp3', 'audio/music2.mp3', 'audio/music3.mp3']
let currentSongIndex = 0;

let audio = new Audio(songs[currentSongIndex]);

// Function to play the next song
function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    audio.src = songs[currentSongIndex];
    audio.play();
}

// Event listener for the ended event, to play the next song
audio.addEventListener('ended', playNextSong);

function updateSpeakerImage(playing, lightsOff) {
    var speaker = document.querySelector('.speaker');
    if (playing) {
        if (lightsOff) {
            speaker.style.backgroundImage = 'url(\'../images/SpeakerW.png\')';
        } else {
            speaker.style.backgroundImage = 'url(\'../images/SpeakerD.png\')';
        }
    } else { //not playing 
        if (lightsOff) {
            speaker.style.backgroundImage = 'url(\'../images/SpeakerWOff.png\')';
        } else {
            speaker.style.backgroundImage = 'url(\'../images/SpeakerDOff.png\')';
        }
    }
}
// Event listener for the musicPlayer checkbox
musicPlayer.addEventListener('change', function () {
    if (musicPlayer.checked) {
        audio.play();
        updateSpeakerImage(true, toggle.checked);
    } else {
        audio.pause();
        updateSpeakerImage(false, toggle.checked);
    }
});

//feed pet request 
const feedButton = document.getElementById('feedButton')
feedButton.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/eat');
        const data = await response.json();
        console.log(data); // Log the response from the API
        updateDisplay();
    } catch (error) {
        console.error('Error:', error);
    }
});

//play pet request
const playButton = document.getElementById('playButton')
playButton.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/play');
        const data = await response.json();
        console.log(data); // Log the response from the API
        updateDisplay();
    } catch (error) {
        console.error('Error:', error);
    }
});
