let userInput = document.getElementById("username");
let passwordInput = document.getElementById("username");
let loginButton = document.getElementById("loginButton");

function checkLoginInput() {
  let userValue = userInput.value.trim();
  let passwordValue = userInput.value.trim();

  if (userValue.length == 0) {
    userInput.classList.add("border-color: red;");
    return false;
  }
  if (passwordValue.length == 0) {
    passwordInput.classList.add("border-color: red;");
    return false;
  }
  return true;
}

function activateSpinner() {
  let userInput = document.getElementById("username");
  let passwordInput = document.getElementById("username");
  let spinner = document.getElementById("preloader");

  if (userInput.value.length != 0 && passwordInput.value.length != 0) {
    spinner.style.display = "block";
  }
}
