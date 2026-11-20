const minLengthInput = document.getElementById("minLength");
const maxLengthInput = document.getElementById("maxLength");
const includeUpperCheckbox = document.getElementById("includeUpper");
const includeSpecialCheckbox = document.getElementById("includeSpecial");
const generateButton = document.getElementById("generateButton");

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SPECIAL = "!@#$%^&*()_+-=[]{}|;:,.<>?";

function getRandomChar(str) {
  const randomIndex = Math.floor(Math.random() * str.length);
  return str[randomIndex];
}

function generatePassword() {
  const min = parseInt(minLengthInput.value, 10);
  const max = parseInt(maxLengthInput.value, 10);
  const useUpper = includeUpperCheckbox.checked;
  const useSpecial = includeSpecialCheckbox.checked;

  if (isNaN(min) || isNaN(max)) {
    alert("Incorrect password length");
    return;
  }
  if (min <= 0 || max <= 0) {
    alert("Incorrect password length, must be > 0");
    return;
  }
  if (min > max) {
    alert("Incorrect password length - min cant be higher than max");
    return;
  }
  const targetLength = Math.floor(Math.random() * (max - min + 1)) + min;

  let charPool = LOWERCASE;
  if (useUpper) {
    charPool += UPPERCASE;
  }
  if (useSpecial) {
    charPool += SPECIAL;
  }
  const passwordChars = [];
  for (let i = passwordChars.length; i < targetLength; i++) {
    passwordChars.push(getRandomChar(charPool));
  }

  alert(`Wygenerowane hasło: ${passwordChars.join("")}`);
}

generateButton.addEventListener("click", generatePassword);
