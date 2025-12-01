// -------------------------------------------
// BASIC SELECTORS
// -------------------------------------------
const cartIcon = document.querySelector(".cart-icon");
const cartMenu = document.querySelector(".cart-menu");
const closeBtn = document.querySelector(".cart-close-btn");
const cartBody = document.querySelector(".cart-body");
const cartCount = document.querySelector(".cart-count");
const totalPriceText = document.querySelector(".cart-footer h3");

let cart = [];
let total = 0;


// -------------------------------------------
// ⭐ UPDATE LOGIN / LOGOUT BUTTON
// -------------------------------------------
function updateAuthButtons() {
    const token = localStorage.getItem("token");
    const loginBtn = document.querySelector("#login-btn");
    const logoutBtn = document.querySelector("#logout-btn");

    if (token) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
    }
}


// -------------------------------------------
// ⭐ PAGE LOAD
// -------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

    updateAuthButtons();

    loadProducts();

    const user_id = localStorage.getItem("user_id");
    if (user_id) loadCart(user_id);
});


// -------------------------------------------
// ⭐ LOGIN BUTTON ACTION
// -------------------------------------------
document.querySelector("#login-btn").addEventListener("click", () => {
    window.location.href = "login.html";
});


// -------------------------------------------
// ⭐ LOGOUT BUTTON ACTION (FIXED)
// -------------------------------------------
document.querySelector("#logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");

    alert("Logged out successfully!");

    updateAuthButtons();
    window.location.reload();
});


// -------------------------------------------
// ⭐ LOAD PRODUCTS
// -------------------------------------------
function loadProducts() {
    fetch("http://127.0.0.1:8000/products")
        .then(res => res.json())
        .then(data => displayProducts(data.products))
        .catch(err => console.log("Error loading products:", err));
}


// -------------------------------------------
// ⭐ DISPLAY PRODUCTS
// -------------------------------------------
function displayProducts(products) {
    const container = document.getElementById("product-container");
    container.innerHTML = "";

    products.forEach(product => {
        const box = document.createElement("div");
        box.classList.add("box");

        box.innerHTML = `
        <div class="box-img">
            <h3 id="name">${product.name}</h3>
            <img src="${product.image}">
            <p id="price">Price-${product.price}</p>
            <button class="add-btn" data-id="${product.id}">Add</button>
        </div>
        `;

        container.appendChild(box);
    });

    attachAddButtonEvents();
}


// -------------------------------------------
// ⭐ ADD BUTTON CLICK EVENTS
// -------------------------------------------
function attachAddButtonEvents() {
    const addButtons = document.querySelectorAll(".add-btn");

    addButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const user_id = localStorage.getItem("user_id");
            const product_id = btn.getAttribute("data-id");

            addToCart(user_id, product_id);
        });
    });
}


// -------------------------------------------
// ⭐ ADD TO CART (BACKEND)
// -------------------------------------------
function addToCart(user_id, product_id) {
    if (!user_id) {
        alert("Please login to add items");
        window.location.href = "login.html";
        return;
    }

    fetch(`http://127.0.0.1:8000/cart/add/${user_id}/${product_id}`, {
        method: "POST"
    })
    .then(res => res.json())
    .then(() => loadCart(user_id));
}


// -------------------------------------------
// ⭐ LOAD CART FROM BACKEND
// -------------------------------------------
function loadCart(user_id) {
    fetch(`http://127.0.0.1:8000/cart/${user_id}`)
        .then(res => res.json())
        .then(data => {
            cart = data.cart;
            total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            updateCartUI();
        });
}


// -------------------------------------------
// ⭐ UPDATE CART UI
// -------------------------------------------
function updateCartUI() {
    cartCount.innerText = cart.length;
    cartBody.innerHTML = "";

    if (cart.length === 0) {
        cartBody.innerHTML = `<p class="empty-msg">Your cart is empty</p>`;
        totalPriceText.innerHTML = `Total: ₹0`;
        return;
    }

    cart.forEach(item => {
        cartBody.innerHTML += `
        <div class="cart-item">
            <p>${item.name} - ₹${item.price} x ${item.quantity}</p>
        </div>
        `;
    });

    totalPriceText.innerHTML = `Total: ₹${total}`;
}


// -------------------------------------------
// ⭐ CART MENU OPEN/CLOSE
// -------------------------------------------
cartIcon.addEventListener("click", () => {
    cartMenu.classList.add("cart-open");
});

closeBtn.addEventListener("click", () => {
    cartMenu.classList.remove("cart-open");
});


// -------------------------------------------
// ⭐ LIVE SEARCH
// -------------------------------------------
document.querySelector(".ser").addEventListener("input", function () {
    let text = this.value.toLowerCase();

    fetch("http://127.0.0.1:8000/products")
        .then(res => res.json())
        .then(data => {
            let filtered = data.products.filter(p =>
                p.name.toLowerCase().includes(text)
            );
            displayProducts(filtered);
        });
});
