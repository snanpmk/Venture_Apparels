console.log("hey");
// Function to handle checkbox changes
function handleCheckboxChange() {
  // Get the container element
  var container = document.querySelector(".allcategory");

  // Get all checked checkboxes within the container
  var checkedCheckboxes = container.querySelectorAll(
    'input[type="checkbox"]:checked'
  );

  const checkedFilters = []; // or any other property you want to access
  checkedCheckboxes.forEach(function (checkbox) {
    checkedFilters.push(checkbox.id);
  });
  console.log(checkedFilters+"❤️❤️❤️❤️❤️");

  const checkedFiltersData = JSON.stringify(checkedFilters)
  const url = "/category/apply-filter";
  const method = "PUT"
  const body = checkedFiltersData
  const headers = {
    'Content-Type': 'application/json',
  }
  fetch(url,{
    method,
    headers,
    body
  })
  .then((response) => response.json())
  .then((data)=>{
    updateProductCards(data.products);
  })
  .catch((error)=>{
    console.log(error+"error in applying filters");
  })
  

  // Loop through the checked checkboxes and log their values
  console.log(checkedFilters);
}

// Get all checkboxes within the container
var checkboxes = document.querySelectorAll(
  '.filter-options input[type="checkbox"]'
);

// Get all checkboxes within the container
var checkboxesInMobileView = document.querySelectorAll(
  '.filter-options input[type="checkbox"]'
);

// Attach event listener to each checkbox
checkboxes.forEach(function (checkbox) {
  checkbox.addEventListener("change", handleCheckboxChange);
});
