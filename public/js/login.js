function login() {
    let user = document.getElementById("user").value;
    let password = document.getElementById("password").value;

    fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            user: user,
            password: password,
          },
        }),
      });
}