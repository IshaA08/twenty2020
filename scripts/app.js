/**
 * app.js
 */

// Get references to Document Object Model (DOM) elements via their IDs, which can then
// be used later to update UI or react to user actions
const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const soundToggle = document.getElementById("sound-toggle");
const autoToggle = document.getElementById("auto-toggle");
const breakInput = document.getElementById("break-time");
const widgetQuote = document.getElementById("quote");
const widgetTip = document.getElementById("tip");
const DEFAULT_WORK_TIME = 20 * 60; // default for the timer is 20 minutes

// Map chime sounds to values
const chimeSounds = {
    "soft-bell": new Audio("assets/bell.mp3"),
    "gentle-ping": new Audio("assets/chime.mp3"),
    "classic-beep": new Audio("assets/simple.mp3"),
};

// Map ambient sounds to values
const ambientSounds = {
    "rain": new Audio("assets/rain.mp3"),
    "rain-thunder": new Audio("assets/rain-and-thunder.mp3"),
    "fireplace": new Audio("assets/fireplace.mp3")
};

// Map bgm sounds to values
const bgmSounds = {
    "beat-1": new Audio("assets/night-detective.mp3"),
    "beat-2": new Audio("assets/lofi-beat.mp3"),
    "beat-3": new Audio("assets/smoke.mp3")
};

// Enable looping for each ambient track
Object.values(ambientSounds).forEach(audio => {
    audio.loop = true;
});

// Enable looping for each bgm track
Object.values(bgmSounds).forEach(audio => {
    audio.loop = true;
});

let timer; // timer ID for the interval used for clearing or restarting
let isBreak = false; // flag that checks whether the timer is in break or work mode
let isRunning = false; // flag used to toggle timer button from "Start" to "Pause"
let timeLeft = 20 * 60; // the remaining time in each interval

// Sound defaults
let currentChime = document.querySelector('input[name="chime"]:checked').value;
let currentAmbient = null;
let currentBgm = null;

// Sound/Volume controls
const chimeVolumeSlider = document.getElementById("chime-volume");
const ambientVolumeSlider = document.getElementById("ambient-volume");
const bgmVolumeSlider = document.getElementById("bgm-volume");

// Progress bar controls
const progressBar = document.getElementById('current-progress');

function updateProgressBar() {
    let totalDuration = isBreak ? parseInt(breakInput.value, 10) : DEFAULT_WORK_TIME;
    let elapsed = totalDuration - timeLeft;
    let percent = (elapsed / totalDuration) * 100;
    progressBar.style.width = `${percent}%`;
}


// Set initial volume on all sounds
Object.values(chimeSounds).forEach(audio => audio.volume = parseFloat(chimeVolumeSlider.value));
Object.values(ambientSounds).forEach(audio => audio.volume = parseFloat(ambientVolumeSlider.value));
Object.values(bgmSounds).forEach(audio => audio.volume = parseFloat(bgmVolumeSlider.value));

// REMOVE THIS LATER beep - Use Web Audio API to create Audio object that can be played
// const beep = new Audio("assets/beep.mp3");

// Update the browser tab's title to show the timer countdown or break status
function updateTabTitle() {
    if (isBreak) {
        document.title = "Break time!";
    } else {
        const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
        const secs = (timeLeft % 60).toString().padStart(2, "0");
        document.title = `${mins}:${secs}`;
    }
}

// Since js doesnt have a way to overload functions, add in a new method that updates
// tab based on str passed to it
function updateTabTitleWithText(txt_str) {
    // Add type and error checking here
    document.title = document.title + txt_str;
}

// Update the visible timer on the webpage
function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const secs = (timeLeft % 60).toString().padStart(2, "0");
    timerDisplay.textContent = `${mins}:${secs}`;
}

// Send desktop notification using Notification API if permission given
function notify(msg) {
    if (Notification.permission === "granted") {
        new Notification(msg);
    }
    if (currentChime && currentChime !== "none") {
        const chimeAudio = chimeSounds[currentChime];
        if (chimeAudio) {
            chimeAudio.play();
        }
    }
}

// Toggle between break and work mode. Break time is read from user input given in form field
function switchMode() {
    isBreak = !isBreak;
    if (isBreak) {
        timeLeft = parseInt(breakInput.value, 10);
        notify("Break time - Look at something about 20ft away");
    } else {
        timeLeft = 20 * 60;
        notify("Break done!");
    }
}

// Start a repeating timer that runs every 1000ms/1s
function startTimer() {
    //clearInterval(timer);
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
            updateProgressBar();
            updateTabTitle();
        } else {
            switchMode();
            updateTimerDisplay();
            updateProgressBar();
            updateTabTitle();
            if (!autoToggle.checked) {
                clearInterval(timer);
            }
        }
    }, 1000);
}

// Used to stop playing ambient tracks
function stopAmbientSound() {
    if (currentAmbient) {
        currentAmbient.pause();
        currentAmbient.currentTime = 0;
        currentAmbient = null;
    }
}

// Used to stop playing bgm tracks
function stopBgmSound() {
    if (currentBgm) {
        currentBgm.pause();
        currentBgm.currentTime = 0;
        currentBgm = null;
    }
}

// Event listener for Start button that requests notification permission, updates timer display and starts timer
startBtn.addEventListener("click", () => {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    if (isRunning) {
        // Pause the timer
        clearInterval(timer);
        isRunning = false;
        startBtn.textContent = "Resume";
        updateTabTitleWithText(" - Paused");
    } else {
        // Start the timer
        updateTimerDisplay();
        startTimer();
        isRunning = true;
        startBtn.textContent = "Pause";
        updateTabTitle();
    }

    //updateTimerDisplay();
    //startTimer();
});

resetBtn.addEventListener("click", () => {
    clearInterval(timer); // Stop the timer if running
    timer = null;
    isRunning = false;
    isBreak = false;
    breakInput.value = "20";

    timeLeft = DEFAULT_WORK_TIME;

    updateTimerDisplay();
    updateProgressBar();
    updateTabTitle();

    startBtn.textContent = "Start";
});

// Change the chime setting depending on what the user selects
document.querySelectorAll('input[name="chime"]').forEach(input => {
    input.addEventListener("change", () => {
        currentChime = input.value;
        //console.log("Current chime is: " + currentChime);
        // temp = chimeSounds[currentChime];
        // temp.play();
    });
});

// Change or play ambient tracks depending on user selection events
document.querySelectorAll('input[name="ambient"]').forEach(input => {
    input.addEventListener("change", () => {
        const selected = input.value;

        // Stop the current sound
        stopAmbientSound();

        // Play the new one (unless it's "none")
        if (selected !== "none") {
            currentAmbient = ambientSounds[selected];
            if (currentAmbient) {
                currentAmbient.play();
            }
        }
        //console.log("Current ambient track: " + selected);
    });
});

// Change or play bgm tracks depending on user selection events
document.querySelectorAll('input[name="bgm"]').forEach(input => {
    input.addEventListener("change", () => {
        const selected = input.value;

        // Stop the current sound
        stopBgmSound();

        // Play the new one (unless it's "none")
        if (selected !== "none") {
            currentBgm = bgmSounds[selected];
            if (currentBgm) {
                currentBgm.play();
            }
        }
        //console.log("Current bgm track: " + selected);
    });
});

// Update chime volume on slider input
chimeVolumeSlider.addEventListener("input", () => {
    const newVolume = parseFloat(chimeVolumeSlider.value);
    Object.values(chimeSounds).forEach(audio => audio.volume = newVolume);
    //console.log("Chime volume: " + newVolume);
});

// Update ambient sound volume on slider input
ambientVolumeSlider.addEventListener("input", () => {
    const newVolume = parseFloat(ambientVolumeSlider.value);
    Object.values(ambientSounds).forEach(audio => audio.volume = newVolume);
    // console.log("Ambient volume: " + newVolume);
});

// Update BGM volume on slider input
bgmVolumeSlider.addEventListener("input", () => {
    const newVolume = parseFloat(bgmVolumeSlider.value);
    Object.values(bgmSounds).forEach(audio => audio.volume = newVolume);
    // console.log("bgm volume: " + newVolume);
});

// Change appearance based on user input
document.querySelectorAll('input[name="theme"]').forEach(input => {
    input.addEventListener("change", () => {
        // Remove any current theme classes
        document.body.classList.remove("light-mode", "dark-mode", "bubblegum-theme", "forest-theme", "ocean-theme", "sunny-theme");

        // Add the new theme class
        const selectedTheme = input.value;

        if (selectedTheme === "light" || selectedTheme === "dark") {
            document.body.classList.add(`${selectedTheme}-mode`);
        } else {
            document.body.classList.add(`${selectedTheme}-theme`);
        }
    });
});

// Use Fetch API to load JSON data asynchronously to load widgets
fetch("data/quotes.json")
    .then(response => response.json())
    .then(data => {
        // Pick a random quote to display in the widget
        const quote = data[Math.floor(Math.random() * data.length)];
        widgetQuote.textContent = quote;
    });

fetch("data/tips.json")
    .then(response => response.json())
    .then(data => {
        // Pick a random tip to display in the widget
        const tip = data[Math.floor(Math.random() * data.length)];
        widgetTip.textContent = tip;
    });

updateTimerDisplay();
updateProgressBar();
