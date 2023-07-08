// USER SIGNUP VALIDATION--------->

// User name validation
const nameInput = document.getElementById("name");
const nameValidMessage = document.getElementById("nameValidMessage");

nameInput.addEventListener("input", function () {
  const name = nameInput.value.trim();
  const isValidName = validateName(name);

  if (isValidName) {
    nameInput.classList.remove("is-invalid");
    nameValidMessage.style.display = "none";
  } else {
    nameInput.classList.add("is-invalid");
    nameValidMessage.style.display = "block";
    nameValidMessage.textContent = "Please enter a valid name";
  }
});   

nameInput.addEventListener("blur", function () {
  const name = nameInput.value.trim();

  if (name === "") {
    nameInput.classList.add("is-invalid");
    nameValidMessage.style.display = "block";
    nameValidMessage.textContent = "Your name is required";
  }
});

function validateName(name) {
  const nameRegex = /^[a-zA-Z\s]+$/;
  const minLength = 3;

  return nameRegex.test(name) && name.length >= minLength;
}

// Phone Number validation
const countryCodeSelect = document.querySelector("#countryCode");
const phoneNumberInput = document.querySelector("#phoneNumber");
const phoneNumberValidMessage = document.querySelector(
  "#phoneNumberValidMessage"
);

countryCodeSelect.addEventListener("change", function () {
  const countryCode = countryCodeSelect.value;
  const country =
    countryCodeSelect.options[countryCodeSelect.selectedIndex].text;
  const requiredLength = getRequiredPhoneNumberLength(country);

  phoneNumberInput.placeholder = `Enter your phone number (${countryCode})`;

  validatePhoneNumber(requiredLength, phoneNumberInput.value);
});

phoneNumberInput.addEventListener("input", function () {
  const phoneNumber = phoneNumberInput.value;
  const country =
    countryCodeSelect.options[countryCodeSelect.selectedIndex].text;
  const requiredLength = getRequiredPhoneNumberLength(country);

  validatePhoneNumber(requiredLength, phoneNumber);
});

phoneNumberInput.addEventListener("blur", function () {
  const phoneNumber = phoneNumberInput.value.trim();

  if (phoneNumber === "") {
    phoneNumberInput.classList.add("is-invalid");
    phoneNumberValidMessage.style.display = "block";
    phoneNumberValidMessage.textContent = "Your Phone number is required";
  }
});

function getRequiredPhoneNumberLength(country) {
  const requiredLengths = {
    "+91": 10, // India: 10-digit mobile number
    "+1": 10, // USA: 10-digit phone number
    "+44": 10, // UK: 10-digit phone number
    "+86": 11, // China: 11-digit phone number
    "+81": 10, // Japan: 10-digit phone number
  };

  return requiredLengths[country] || 0;
}

function validatePhoneNumber(requiredLength, phoneNumber) {
  const phoneNumberRegex = /^\d+$/;
  const isValidFormat = phoneNumberRegex.test(phoneNumber);
  const isValidLength = phoneNumber.length === requiredLength;

  if (isValidFormat && isValidLength) {
    phoneNumberInput.classList.remove("is-invalid");
    phoneNumberValidMessage.style.display = "none";
  } else {
    phoneNumberInput.classList.add("is-invalid");
    phoneNumberValidMessage.style.display = "block";
    phoneNumberValidMessage.textContent = "Invalid Mobile number format";
  }
  if (phoneNumber.trim() === "") {
    phoneNumberInput.classList.add("is-invalid");
    phoneNumberValidMessage.style.display = "block";
    phoneNumberValidMessage.textContent = "Mobile number required";
  }
}

// Email validation
const emailInput = document.getElementById("email");
const emailValidMessage = document.getElementById("emailValidMessage");

emailInput.addEventListener("input", function () {
  const email = emailInput.value;
  const isValidEmail = validateEmail(email);

  if (isValidEmail) {
    emailInput.classList.remove("is-invalid");
    emailValidMessage.style.display = "none";
  } else {
    emailInput.classList.add("is-invalid");
    emailValidMessage.style.display = "block";
    emailValidMessage.textContent = "Invalid email format";
  }

  if (email.trim() === "") {
    emailInput.classList.add("is-invalid");
    emailValidMessage.style.display = "block";
    emailValidMessage.textContent = "Email is required";
  }
});

emailInput.addEventListener("blur", function () {
  const email = emailInput.value.trim();

  if (email === "") {
    emailInput.classList.add("is-invalid");
    emailValidMessage.style.display = "block";
    emailValidMessage.textContent = "Your email is required";
  }
});

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password strength validation
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirmPassword");
const passwordMatchMessage = document.querySelector("#passwordMatchMessage");
const passwordStrengthMessage = document.querySelector(
  "#passwordStrengthMessage"
);

passwordInput.addEventListener("input", function () {
  const password = passwordInput.value;
  const passwordErrorMessages = [];

  if (password.length < 8) {
    passwordErrorMessages.push("be at least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    passwordErrorMessages.push("contain an uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    passwordErrorMessages.push("contain a lowercase letter");
  }

  if (!/[!@#$%^&*]/.test(password)) {
    passwordErrorMessages.push("contain a special character");
  }

  if (passwordErrorMessages.length > 0) {
    passwordInput.classList.add("is-invalid");
    passwordStrengthMessage.textContent =
      "Password must " + passwordErrorMessages.join(", ");
    passwordStrengthMessage.style.display = "block";
  } else {
    passwordInput.classList.remove("is-invalid");
    passwordStrengthMessage.style.display = "none";
  }

  if (password.trim() === "") {
    passwordInput.classList.add("is-invalid");
    passwordStrengthMessage.textContent = "Password is required";
    passwordStrengthMessage.style.display = "block";
  }
});

passwordInput.addEventListener("blur", function () {
  const password = passwordInput.value.trim();

  if (password === "") {
    passwordInput.classList.add("is-invalid");
    passwordStrengthMessage.style.display = "block";
    passwordStrengthMessage.textContent = "Your password is required";
  }
});

confirmPasswordInput.addEventListener("input", function () {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (password === confirmPassword) {
    confirmPasswordInput.classList.remove("is-invalid");
    passwordMatchMessage.style.display = "none";
  } else {
    confirmPasswordInput.classList.add("is-invalid");
    passwordMatchMessage.style.display = "block";
  }
});

// Error message display from the backend
const errorMessage = document.getElementById("errorMessage");

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";

  setTimeout(() => {
    errorMessage.style.display = "none";
  }, 3000);
}

// Form submission
const form = document.querySelector("form");
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Check if any error messages are displayed
  const errorMessages = document.querySelectorAll(".is-invalid");
  if (errorMessages.length > 0) {
    return; // Prevent form submission if errors are present
  }

  const name = nameInput.value.trim();
  const countryCode = countryCodeSelect.value;
  const phoneNumber = phoneNumberInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Validate phone number one more time before submitting
  const country =
    countryCodeSelect.options[countryCodeSelect.selectedIndex].text;
  const requiredLength = getRequiredPhoneNumberLength(country);
  validatePhoneNumber(requiredLength, phoneNumber);

  // Check if the phone number is now valid
  if (phoneNumberInput.classList.contains("is-invalid")) {
    return; // Prevent form submission if phone number is invalid
  }

  try {
    const response = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        countryCode,
        phoneNumber,
        email,
        password,
        confirmPassword,
      }),
    });
    const data = await response.json();
    console.log(data);
    if (data.success) {
      console.log("Signup successful");
      window.location.href = "/enter-otp";
    } else {
      console.log("Signup failed");
      showError(data.error);
    }
  } catch (error) {
    console.log("An error occurred during signup", error);
    showError("An error occurred during signup. Please try again.");
  }
});
