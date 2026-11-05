document.addEventListener("DOMContentLoaded", () => {
  const clockElement = document.getElementById("live-clock");
  function updateClock() {
    if (!clockElement) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((button) => {
    button.addEventListener("click", () => {
      const currentItem = button.closest(".faq-item");
      currentItem.classList.toggle("open");
    });
  });
});

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  const emailInput = document.getElementById("email");
  const subjectSelect = document.getElementById("subject");
  const messageTextarea = document.getElementById("message");

  const emailError = document.getElementById("email-error");
  const subjectError = document.getElementById("subject-error");
  const messageError = document.getElementById("message-error");
  const formStatus = document.getElementById("form-status");

  const savedEmail = localStorage.getItem("draft_email");
  const savedMessage = localStorage.getItem("draft_message");

  if (savedEmail) emailInput.value = savedEmail;
  if (savedMessage) messageTextarea.value = savedMessage;

  emailInput.addEventListener("input", () => {
    localStorage.setItem("draft_email", emailInput.value);
  });

  messageTextarea.addEventListener("input", () => {
    localStorage.setItem("draft_message", messageTextarea.value);
  });

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = true;
    emailError.textContent = "";
    subjectError.textContent = "";
    messageError.textContent = "";
    formStatus.className = "form-status";
    formStatus.style.display = "none";

    const emailValue = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValue) {
      emailError.textContent = "Podanie adresu e-mail jest wymagane.";
      isValid = false;
    } else if (!emailRegex.test(emailValue)) {
      emailError.textContent =
        "Wprowadź poprawny adres e-mail (np. example@student.agh.edu.pl).";
      isValid = false;
    }

    if (!subjectSelect.value) {
      subjectError.textContent = "Proszę wybrać temat wiadomości z listy.";
      isValid = false;
    }

    const messageValue = messageTextarea.value.trim();
    if (!messageValue) {
      messageError.textContent = "Treść wiadomości nie może być pusta.";
      isValid = false;
    } else if (messageValue.length < 10) {
      messageError.textContent =
        "Wiadomość musi zawierać co najmniej 10 znaków.";
      isValid = false;
    }

    if (isValid) {
      formStatus.textContent = "Twoja wiadomość została pomyślnie wysłana.";
      formStatus.className = "form-status success";
      formStatus.style.display = "block";

      contactForm.reset();
      localStorage.removeItem("draft_email");
      localStorage.removeItem("draft_message");
    }
  });
}
//dark theme
const themeToggleBtn = document.getElementById("theme-toggle");
const currentTheme = localStorage.getItem("theme");
if (currentTheme === "dark") {
  document.body.classList.add("dark-theme");
  if (themeToggleBtn) themeToggleBtn.textContent = "☀️";
}
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");
    if (isDark) {
      themeToggleBtn.textContent = "☀️";
      localStorage.setItem("theme", "dark");
    } else {
      themeToggleBtn.textContent = "🌙";
      localStorage.setItem("theme", "light");
    }
  });
}
