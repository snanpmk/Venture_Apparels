// Error message display from the backend
const errorMessage = document.getElementById("errorMessage");

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";

  setTimeout(() => {
    errorMessage.style.display = "none";
  }, 3000);
}

// refrence to the email and password
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Form submission
const form = document.querySelector("form");
form.addEventListener("submit", async function (event) {
  console.log("heeey");
  event.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();
    console.log(data);
    if (data.success) {
      console.log("login successful");
      window.location.href = "/";
    } else {
      console.log("Signup failed");
      showError(data.error);
    }
  } catch (error) {
    console.log("An error occurred during login", error);
    showError("An error occurred during login. Please try again.");
  }


});
