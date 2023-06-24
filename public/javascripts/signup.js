// Get the country code select element
const countryCodeSelect = document.querySelector("#countryCode");

// Update the phone number input placeholder based on the selected country code
const phoneNumberInput = document.querySelector("#phoneNumber");
countryCodeSelect.addEventListener("change", function () {
  const countryCode = countryCodeSelect.value;
  phoneNumberInput.placeholder = `Enter your phone number (${countryCode})`;
});

// Validate form on submission
function validateForm() {
  const password = document.querySelector("#password").value;
  const confirmPassword = document.querySelector("#confirmPassword").value;
  const passwordMatchMessage = document.querySelector("#passwordMatchMessage");

  if (password !== confirmPassword) {
    passwordMatchMessage.style.display = "block";
    return false;
  }

  return true;
}

const errorContainer = document.getElementById("errorContainer");
const errorMessage = document.getElementById("errorMessage");

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}

const form = document.querySelector("form");
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const countryCode = countryCodeSelect.options[countryCodeSelect.selectedIndex].value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const email = document.getElementById("email").value; 
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

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

    if (response.ok) {
      console.log("Signup successful");
      window.location.href = "/getotp";
    } else {
      console.log("Signup failed");
      showError(data.error);
    }
  } catch (error) {
    console.log("An error occurred during signup", error);
    showError("An error occurred during signup. Please try again.");
  }
});
