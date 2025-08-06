const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const saveBtn = document.getElementById("save-btn");
const loadBtn = document.getElementById("load-btn");
const clearBtn = document.getElementById("clear-btn");
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
let currentSelectedAmbient = null;
let currentBgm = null;
let currentSelectedBgm = null;

// Sound/Volume controls
const chimeVolumeSlider = document.getElementById("chime-volume");
let currentChimeVolume = 1;
const ambientVolumeSlider = document.getElementById("ambient-volume");
let currentAmbientVolume = 1;
const bgmVolumeSlider = document.getElementById("bgm-volume");
let currentBgmVolume = 1;

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

// Persistence helper functions - using local storage
function saveSetting(key, value) {
    localStorage.setItem(key, value);
}

function getSetting(key, defaultValue = null) {
    return localStorage.getItem(key) || defaultValue;
}

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

// Save button functionality
saveBtn.addEventListener("click", () => {
    // Save all sound settings using local storage
    saveSetting("chime", currentChime);
    saveSetting("ambient", currentSelectedAmbient);
    saveSetting("bgm", currentSelectedBgm);
    saveSetting("chimeVolume", currentChimeVolume);
    saveSetting("ambientVolume", currentAmbientVolume);
    saveSetting("bgmVolume", currentBgmVolume);
    saveSetting("autoToggle", autoToggle.checked);
    saveSetting("breakInput", breakInput.value);
    //  console.log("saved the following: chime " + currentChime + " amb " + currentSelectedAmbient + " bgm " + currentSelectedBgm);
    //  console.log("saved these vols for chime " + currentChimeVolume + " amb " + currentAmbientVolume + " bgm " + currentBgmVolume);
    //  console.log("saved these for autotoggle: " + autoToggle.checked + " breakinput " + breakInput.value);
});

// Load button functionality
loadBtn.addEventListener("click", () => {
    // Load all saved settings
    // Chime
    const savedChime = getSetting("chime");
    if (savedChime) {
        document.querySelector(`input[name="chime"][value="${savedChime}"]`).checked = true;
        currentChime = savedChime;
    }

    // Ambient
    const savedAmbient = getSetting("ambient");
    if (savedAmbient) {
        document.querySelector(`input[name="ambient"][value="${savedAmbient}"]`).checked = true;
        if (savedAmbient !== "none") {
            currentAmbient = ambientSounds[savedAmbient];
            currentSelectedAmbient = savedAmbient;
            if (currentAmbient) currentAmbient.play();
        }
    }

    // BGM
    const savedBgm = getSetting("bgm");
    if (savedBgm) {
        document.querySelector(`input[name="bgm"][value="${savedBgm}"]`).checked = true;
        if (savedBgm !== "none") {
            currentBgm = bgmSounds[savedBgm];
            currentSelectedBgm = savedBgm;
            if (currentBgm) currentBgm.play();
        }
    }

    // Volumes
    const savedChimeVol = parseFloat(getSetting("chimeVolume", "1"));
    const savedAmbientVol = parseFloat(getSetting("ambientVolume", "1"));
    const savedBgmVol = parseFloat(getSetting("bgmVolume", "1"));

    chimeVolumeSlider.value = savedChimeVol;
    ambientVolumeSlider.value = savedAmbientVol;
    bgmVolumeSlider.value = savedBgmVol;

    currentChimeVolume = savedChimeVol;
    currentAmbientVolume = savedAmbientVol;
    currentBgmVolume = savedBgmVol;

    Object.values(chimeSounds).forEach(audio => audio.volume = savedChimeVol);
    Object.values(ambientSounds).forEach(audio => audio.volume = savedAmbientVol);
    Object.values(bgmSounds).forEach(audio => audio.volume = savedBgmVol);

    // Auto toggle
    const savedToggle = getSetting("autoToggle", false);
    // autoToggle.checked = savedToggle;
    autoToggle.checked = savedToggle === "true";

    // Break input
    const savedBreakInput = parseInt(getSetting("breakInput", 20));
    breakInput.value = savedBreakInput;

    // console.log("loaded values for chime " + currentChime + " amb " + currentSelectedAmbient + " bgm " + currentSelectedBgm);
    // console.log("loaded vols for chime " + currentChimeVolume + " amb " + currentAmbientVolume + " bgm " + currentBgmVolume);
    // console.log("loaded these vals for autotoggle " + savedToggle + " breakinput " + savedBreakInput);
});

// Reset button functionality
clearBtn.addEventListener("click", () => {
    localStorage.clear();
});

// Change the chime setting depending on what the user selects
document.querySelectorAll('input[name="chime"]').forEach(input => {
    input.addEventListener("change", () => {
        currentChime = input.value;
    });
});

// Change or play ambient tracks depending on user selection events
document.querySelectorAll('input[name="ambient"]').forEach(input => {
    input.addEventListener("change", () => {
        const selected = input.value;
        currentSelectedAmbient = input.value;

        // Stop the current sound
        stopAmbientSound();

        // Play the new one (unless it's "none")
        if (selected !== "none") {
            currentAmbient = ambientSounds[selected];
            if (currentAmbient) {
                currentAmbient.play();
            }
        }
    });
});

// Change or play bgm tracks depending on user selection events
document.querySelectorAll('input[name="bgm"]').forEach(input => {
    input.addEventListener("change", () => {
        const selected = input.value;
        currentSelectedBgm = input.value;

        // Stop the current sound
        stopBgmSound();

        // Play the new one (unless it's "none")
        if (selected !== "none") {
            currentBgm = bgmSounds[selected];
            if (currentBgm) {
                currentBgm.play();
            }
        }
    });
});

// Update chime volume on slider input
chimeVolumeSlider.addEventListener("input", () => {
    const newVolume = parseFloat(chimeVolumeSlider.value);
    currentChimeVolume = newVolume;
    Object.values(chimeSounds).forEach(audio => audio.volume = newVolume);
});

// Update ambient sound volume on slider input
ambientVolumeSlider.addEventListener("input", () => {
    const newVolume = parseFloat(ambientVolumeSlider.value);
    currentAmbientVolume = newVolume;
    Object.values(ambientSounds).forEach(audio => audio.volume = newVolume);
});

// Update BGM volume on slider input
bgmVolumeSlider.addEventListener("input", () => {
    const newVolume = parseFloat(bgmVolumeSlider.value);
    currentBgmVolume = newVolume;
    Object.values(bgmSounds).forEach(audio => audio.volume = newVolume);
});

// Change appearance based on user input
document.querySelectorAll('input[name="theme"]').forEach(input => {
    input.addEventListener("change", () => {
        // Remove any current theme classes
        document.body.classList.remove("light-mode", "dark-mode", "bubblegum-theme", "forest-theme", "ocean-theme", "sunny-theme");

        // Add the new theme class
        const selectedTheme = input.value;
        // Persist theme setting
        saveSetting("theme", selectedTheme);

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

// Load in user settings
function applySavedSettings() {
    // Theme
    const savedTheme = getSetting("theme");
    document.body.className = ''; // clear existing theme classes
    if (savedTheme) {
        document.querySelector(`input[name="theme"][value="${savedTheme}"]`).checked = true;
    }
    if (savedTheme === "light" || savedTheme === "dark") {
        document.body.classList.add(`${savedTheme}-mode`);
    } else {
        document.body.classList.add(`${savedTheme}-theme`);
    }
}

applySavedSettings();

/* Modal-related actions */
document.addEventListener("DOMContentLoaded", () => {
    const privacyBtn = document.getElementById("privacy-policy-btn");
    const soundBtn = document.getElementById("sound-credits-btn");

    const privacyModal = document.getElementById("privacy-modal");
    const soundModal = document.getElementById("sound-modal");

    // Open modals
    privacyBtn.addEventListener("click", (e) => {
        e.preventDefault();
        privacyModal.classList.remove("hidden");
        document.body.classList.add("no-scroll");
    });

    soundBtn.addEventListener("click", (e) => {
        e.preventDefault();
        soundModal.classList.remove("hidden");
        document.body.classList.add("no-scroll");
    });

    // Close modal buttons
    document.querySelectorAll(".close-button").forEach(btn => {
        btn.addEventListener("click", () => {
            const modalId = btn.dataset.close;
            document.getElementById(modalId).classList.add("hidden");
            document.body.classList.remove("no-scroll");
        });
    });

    // Close modals by clicking outside content
    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.add("hidden");
                document.body.classList.remove("no-scroll");
            }
        });
    });
});
