const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const soundToggle = document.getElementById("sound-toggle");
const autoToggle = document.getElementById("auto-toggle");
const breakInput = document.getElementById("break-time");

let timer;
let isBreak = false;
let timeLeft = 20 * 60;

const beep = new Audio("assets/beep.mp3");

function updateTabTitle() {
    if (isBreak) {
        document.title = "Break time!";
    } else {
        const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
        const secs = (timeLeft % 60).toString().padStart(2, "0");
        document.title = `${mins}:${secs} - twenty2020`;
    }
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const secs = (timeLeft % 60).toString().padStart(2, "0");
    timerDisplay.textContent = `${mins}:${secs}`;
}

function notify(msg) {
    if (Notification.permission === "granted") {
        new Notification(msg);
    }
    if (soundToggle.checked) beep.play();
}

function switchMode() {
    isBreak = !isBreak;
    if (isBreak) {
        timeLeft = parseInt(breakInput.value, 10);
        notify("Break time! Look 20ft away!");
    } else {
        timeLeft = 20 * 60;
        notify("Break done! Back to work.");
    }
}

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

startBtn.addEventListener("click", () => {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
    updateTimerDisplay();
    startTimer();
});

// Load widgets
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

updateTimerDisplay();
updateTabTitle();
