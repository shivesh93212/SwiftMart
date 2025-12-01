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
// ⭐ SHOW LOGIN / LOGOUT BUTTON
// -------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
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
});


// -------------------------------------------
// ⭐ LOGIN BUTTON → LOGIN PAGE
// -------------------------------------------
document.querySelector("#login-btn").addEventListener("click", () => {
    window.location.href = "login.html";
});


// -------------------------------------------
// ⭐ LOGOUT BUTTON
// -------------------------------------------
document.querySelector("#logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    alert("Logged out successfully!");
    window.location.href = "index.html";
});


// -------------------------------------------
// ⭐ LOAD PRODUCTS FROM BACKEND
// -------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    fetch("http://127.0.0.1:8000/products")
        .then(res => res.json())
        .then(data => displayProducts(data.products))
        .catch(err => console.log("Error loading products:", err));
});


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
                <p id="wet">100g</p>
                <p id="price">Price-${product.price}</p>
                <button class="add-btn" data-id="${product.id}">Add</button>
            </div>
        `;

        container.appendChild(box);
    });

    attachAddButtonEvents();
}


// -------------------------------------------
// ⭐ ADD BUTTON EVENT
// -------------------------------------------
function attachAddButtonEvents() {
    const addButtons = document.querySelectorAll(".add-btn");

    addButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const product_id = btn.dataset.id;
            const user_id = localStorage.getItem("user_id");

            if (!user_id) {
                alert("Please login first!");
                window.location.href = "login.html";
                return;
            }

            addToCart(user_id, product_id);
        });
    });
}


// -------------------------------------------
// ⭐ ADD TO CART (Backend)
// -------------------------------------------
function addToCart(user_id, product_id) {
    fetch(`http://127.0.0.1:8000/cart/add/${user_id}/${product_id}`, {
        method: "POST"
    })
    .then(res => res.json())
    .then(() => loadCart(user_id));
}


// -------------------------------------------
// ⭐ LOAD CART FROM BACKEND
// -------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const user_id = localStorage.getItem("user_id");
    if (user_id) loadCart(user_id);
});

function loadCart(user_id) {
    fetch(`http://127.0.0.1:8000/cart/${user_id}`)
        .then(res => res.json())
        .then(data => {
            cart = data.cart;
            total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
            updateCartUI();
        });
}


// -------------------------------------------
// ⭐ UPDATE CART UI
// -------------------------------------------
function updateCartUI() {
    cartBody.innerHTML = "";
    cartCount.innerText = cart.length;

    if (cart.length === 0) {
        cartBody.innerHTML = `<p class="empty-msg">Your cart is empty</p>`;
        totalPriceText.innerHTML = `Total: ₹0`;
        return;
    }

    cart.forEach(item => {
        cartBody.innerHTML += `
            <div class="cart-item">
                <p>${item.name} - ₹${item.price} × ${item.quantity}</p>
                <button class="remove-btn" onclick="removeItem(${item.product_id})">-</button>
            </div>
        `;
    });

    totalPriceText.innerHTML = `Total: ₹${total}`;
}


// -------------------------------------------
// ⭐ REMOVE ITEM FROM CART
// -------------------------------------------
function removeItem(product_id) {
    const user_id = localStorage.getItem("user_id");

    fetch(`http://127.0.0.1:8000/cart/remove/${user_id}/${product_id}`, {
        method: "DELETE"
    })
    .then(() => loadCart(user_id));
}


// -------------------------------------------
// ⭐ CART OPEN/CLOSE
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
    const text = this.value.toLowerCase();

    fetch("http://127.0.0.1:8000/products")
        .then(res => res.json())
        .then(data => {
            const filtered = data.products.filter(p =>
                p.name.toLowerCase().includes(text)
            );
            displayProducts(filtered);
        });
});
