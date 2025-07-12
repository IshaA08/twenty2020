/**
 * app.js
 */

// Get references to Document Object Model (DOM) elements via their IDs, which can then
// be used later to update UI or react to user actions
const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const soundToggle = document.getElementById("sound-toggle");
const autoToggle = document.getElementById("auto-toggle");
const breakInput = document.getElementById("break-time");

let timer; // timer ID for the interval used for clearing or restarting
let isBreak = false; // flag that checks whether the timer is in break or work mode
let timeLeft = 20 * 60; // the remaining time in each interval

// Use Web Audio API to create Audio object that can be played
const beep = new Audio("assets/beep.mp3");

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
    if (soundToggle.checked) beep.play();
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
    clearInterval(timer);
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
            updateTabTitle();
        } else {
            switchMode();
            updateTimerDisplay();
            updateTabTitle();
            if (!autoToggle.checked) {
                clearInterval(timer);
            }
        }
    }, 1000);
}

// Event listener for Start button that requests notification permission, updates timer display and starts timer
startBtn.addEventListener("click", () => {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
    updateTimerDisplay();
    startTimer();
});

// Use Fetch API to load JSON data asynchronously to load widgets
fetch("data/quotes.json")
    .then(res => res.json())
    .then(data => {
        const quote = data[Math.floor(Math.random() * data.length)];
        document.getElementById("quote-box").textContent = quote;
    });

fetch("data/tips.json")
    .then(res => res.json())
    .then(data => {
        const tip = data[Math.floor(Math.random() * data.length)];
        document.getElementById("tip-box").textContent = tip;
    });

// Two calls that initialize timer display and tab title whent the page loads
updateTimerDisplay();
updateTabTitle();
