const firstPassword = document.getElementById("firstPassword");
const secondPassword = document.getElementById("secondPassword");
const requirementsBox = document.getElementById("passwordRequirements");
const emailBox = document.getElementById("emailBox");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const form = document.getElementById("credentials");

// Regex for validation
// these are straight from chatgpt... I don't know Regex like that.
const emailRegex = /^\S+@\S+\.\S+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

// Show/hide password requirements
firstPassword.addEventListener("focus", () => {
  requirementsBox.classList.add("active");
});
firstPassword.addEventListener("blur", () => {
  requirementsBox.classList.remove("active");
});

// Validate email format
function validateEmail() {
  const emailValue = emailBox.value.trim();
  if (!emailRegex.test(emailValue)) {
    emailError.textContent = "Please enter a valid email address.";
    emailBox.classList.add("invalid");
    emailBox.classList.remove("valid");
    return false;
  } else {
    emailError.textContent = "";
    emailBox.classList.add("valid");
    emailBox.classList.remove("invalid");
    return true;
  }
}

//passwords match
function validatePasswordMatch() {
  if (firstPassword.value !== secondPassword.value) {
    passwordError.textContent = "Passwords do not match.";
    secondPassword.classList.add("invalid");
    secondPassword.classList.remove("valid");
    return false;
  } else {
    passwordError.textContent = "";
    secondPassword.classList.add("valid");
    secondPassword.classList.remove("invalid");
    return true;
  }
}

//password requirements
function validatePasswordStrength() {
  if (!passwordRegex.test(firstPassword.value)) {
    passwordError.textContent =
      "Password must be at least 8 characters, include an uppercase, lowercase, number, and special character.";
    firstPassword.classList.add("invalid");
    firstPassword.classList.remove("valid");
    return false;
  } else {
    passwordError.textContent = "";
    firstPassword.classList.add("valid");
    firstPassword.classList.remove("invalid");
    return true;
  }
}

//Prevents form submission if errors are present.
form.addEventListener("submit", function (event) {
  const isEmailValid = validateEmail();
  const isPasswordStrong = validatePasswordStrength();
  const doPasswordsMatch = validatePasswordMatch();

  if (!isEmailValid || !isPasswordStrong || !doPasswordsMatch) {
    event.preventDefault(); // stop the form from submitting
  }
});


emailBox.addEventListener("change", validateEmail);
firstPassword.addEventListener("input", validatePasswordStrength);
secondPassword.addEventListener("input", validatePasswordMatch);
