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
// ⭐ SHOW LOGIN / LOGOUT BUTTON BASED ON TOKEN
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
// ⭐ LOGIN BUTTON CLICK → open login page
// -------------------------------------------
document.querySelector("#login-btn").addEventListener("click", () => {
    window.location.href = "login.html";
});

// -------------------------------------------
// ⭐ LOGOUT BUTTON CLICK
// -------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.querySelector("#logout-btn");

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        alert("Logged out successfully!");
        window.location.href = "index.html";
    });
});

// ❌ IMPORTANT
// Removed FORCE Redirect
// if (!localStorage.getItem("token")) window.location.href = "login.html";

// -------------------------------------------
// ⭐ LOAD CART ITEMS FROM BACKEND
// -------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    fetch("http://127.0.0.1:8000/cart")
        .then(res => res.json())
        .then(data => {
            cart = data.cart;
            total = cart.reduce((sum, item) => sum + item.price, 0);
            updateCartUI();
        })
        .catch(err => console.log("Error loading cart:", err));
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
            <button class="add-btn">Add</button>
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
            const box = btn.parentElement;
            const name = box.querySelector("#name").innerText;
            const price = parseInt(box.querySelector("#price").innerText.replace("Price-", ""));

            addToCart(name, price);
        });
    });
}

// -------------------------------------------
// ⭐ ADD TO CART (frontend + backend)
// -------------------------------------------
function addToCart(name, price) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login to add items in cart");
        window.location.href = "login.html";
        return;
    }

    cart.push({ name, price });
    total += price;
    updateCartUI();

    fetch("http://127.0.0.1:8000/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price })
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

    cart.forEach((item, index) => {
        cartBody.innerHTML += `
        <div class="cart-item">
            <p>${item.name} - ₹${item.price}</p>
            <button class="remove-btn" onclick="removeItem(${index})">X</button>
        </div>`;
    });

    totalPriceText.innerHTML = `Total:₹${total}`;
}

// -------------------------------------------
// ⭐ REMOVE ITEM
// -------------------------------------------
function removeItem(index) {
    total -= cart[index].price;
    cart.splice(index, 1);
    updateCartUI();

    fetch(`http://127.0.0.1:8000/cart/remove/${index}`, {
        method: "DELETE"
    });
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
