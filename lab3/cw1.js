const display = document.getElementById("display");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const resetButton = document.getElementById("resetButton");

let totalSeconds = 0;
let timerInterval = null;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins > 0) {
    return `${mins}min ${secs}s`;
  }
  return `${secs}s`;
}
function startTimer() {
  if (timerInterval != null) {
    return;
  }
  timerInterval = setInterval(() => {
    totalSeconds++;
    display.textContent = formatTime(totalSeconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}
function resetTimer() {
  stopTimer();
  totalSeconds = 0;
  display.textContent = formatTime(totalSeconds);
}

startButton.addEventListener("click", startTimer);
stopButton.addEventListener("click", stopTimer);
resetButton.addEventListener("click", resetTimer);
