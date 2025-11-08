const emailBox = document.getElementById("email");
const passwordBox = document.getElementById("password"); 
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError"); 
const form = document.getElementById("credentials");

// Regex for email validation
const emailRegex = /^\S+@\S+\.\S+$/;

// check email format
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

// Check if password is empty
function validatePassword() {
  const passwordValue = passwordBox.value.trim();
  if (passwordValue === "") {
    passwordError.textContent = "Password cannot be empty.";
    passwordBox.classList.add("invalid");
    passwordBox.classList.remove("valid");
    return false;
  } else {
    passwordError.textContent = "";
    passwordBox.classList.add("valid");
    passwordBox.classList.remove("invalid");
    return true;
  }
}

// Prevent form submission if password is empty or email not proper format
if (form) {
  form.addEventListener("submit", function (event) {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      event.preventDefault(); 
    }
  });
}

emailBox.addEventListener("input", validateEmail);
passwordBox.addEventListener("input", validatePassword);
