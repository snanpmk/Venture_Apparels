function navigateToSearchPage() {
  // Replace "search.html" with the actual URL of your search page
  window.location.href = "/search";
}
let dropdownItems = document.querySelectorAll(".categoryEndPoint");
dropdownItems.forEach((element) => {
  element.addEventListener("click", () => {
    let categoryName = element.textContent;
    let endPoint = categoryName.toLowerCase().replace(/\s/g, "");
    console.log(endPoint);
    console.log(categoryName);
  });
});
