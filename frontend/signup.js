document.querySelector("#signup-btn").addEventListener("click", () => {
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        window.location.href = "login.html";
    });
});
