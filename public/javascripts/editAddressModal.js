  function openEditModal(addressId) {
    // Get the form input elements
    const editAddressForm = document.getElementById("editAddressForm");
    var emailInput = document.getElementById("Email");
    var firstNameInput = document.getElementById("firstName");
    var lastNameInput = document.getElementById("lastName");
    var addressInput = document.getElementById("address");
    var phoneNumberInput = document.getElementById("phoneNumber");
    var countryInput = document.getElementById("country");
    var stateInput = document.getElementById("state");
    var zipCodeInput = document.getElementById("zipCode");
    var useForBillingCheckbox = document.getElementById("same-address");

    // Make a fetch request to retrieve the address data by ID
    fetch(`/get-address/${addressId}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        console.log(data.fname, data.lname);
        // Set the form input values to the address data from the response
        emailInput.value = data.email;
        firstNameInput.value = data.fname;
        lastNameInput.value = data.lname;
        addressInput.value = data.address;
        phoneNumberInput.value = data.phoneNumber;
        countryInput.value = data.country;
        stateInput.value = data.state;
        zipCodeInput.value = data.zipcode;
        useForBillingCheckbox.checked = data.isBillingAddress;

        // Open the modal
        modal.style.display = "block";
      })
      .catch((error) => {
        console.error(error);
      });

    var submitBtn = document.getElementById("submitAddressButton");
    submitBtn.addEventListener("click", function () {
      // Gather the form data
      var formData = new FormData(editAddressForm);

      // Make a fetch request to submit the data to the database
      fetch(`/submit-address/${addressId}`, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          // Handle the response as needed
          console.log("Address submitted successfully!");
          modal.style.display = "none"; // Close the modal after submission
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var modal = document.getElementById("editModal");
    var btn = document.getElementById("editAddressButton");
    var closeBtn = document.getElementsByClassName("btn-close-editModal")[0];

    // Open the modal when the button is clicked
    btn.addEventListener("click", function () {
      // Get the address ID from the button's data attribute
      var addressId = btn.getAttribute("data-address-id");

      // Call the function to open the edit modal with the address details
      openEditModal(addressId);
    });

    // Close the modal when the close button is clicked
    closeBtn.addEventListener("click", function () {
      modal.style.display = "none";
    });

    // Close the modal when the user clicks outside of it
    window.addEventListener("click", function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    });
  });
