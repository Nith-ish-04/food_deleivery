let cart = [];

// Fetch Restaurants on Load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/restaurants');
        const restaurants = await res.json();
        window.allRestaurants = restaurants; // Store for search
        renderRestaurants(restaurants);
        startStatusPolling(); // Start checking for order updates
    } catch (error) {
        document.getElementById('restaurant-grid').innerHTML = '<p>Failed to load restaurants.</p>';
    }
});

// Search Functionality
function filterRestaurants(query) {
    const filtered = window.allRestaurants.filter(r =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.menu.some(m => m.name.toLowerCase().includes(query.toLowerCase()))
    );
    renderRestaurants(filtered);
}

// Status Polling
function startStatusPolling() {
    setInterval(async () => {
        try {
            const res = await fetch('/api/orders'); // This gets all orders
            const orders = await res.json();

            // Find my recent orders (in a real app, filter by user)
            // For demo, just show the latest order status if it's not 'Pending'
            const activeOrder = orders[0]; // Get latest
            if (activeOrder && activeOrder.status === 'Ready') {
                showNotification(`Order #${activeOrder.id} is READY! 🍲`);
            }
        } catch (e) { }
    }, 5000); // Check every 5 seconds
}

function showNotification(msg) {
    const note = document.createElement('div');
    note.style.position = 'fixed';
    note.style.bottom = '20px';
    note.style.left = '50%';
    note.style.transform = 'translateX(-50%)';
    note.style.background = '#48c479';
    note.style.color = 'white';
    note.style.padding = '15px 30px';
    note.style.borderRadius = '50px';
    note.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    note.style.zIndex = '1000';
    note.innerText = msg;
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 5000);
}

function renderRestaurants(restaurants) {
    const grid = document.getElementById('restaurant-grid');
    grid.innerHTML = '';

    restaurants.forEach(rest => {
        const card = document.createElement('div');
        card.className = 'card';

        let menuHtml = '';
        rest.menu.forEach(item => {
            menuHtml += `
                <div class="menu-item">
                    <div>
                        <div style="font-weight:600">${item.name}</div>
                        <div style="font-size:0.8rem; color:#888">₹${item.price}</div>
                    </div>
                    <button class="add-btn" onclick="addToCart('${item.name}', ${item.price}, '${rest.name}')">ADD</button>
                </div>
            `;
        });

        card.innerHTML = `
            <img src="${rest.image}" alt="${rest.name}">
            <div class="card-info">
                <div class="card-name">${rest.name}</div>
                <div class="card-meta">
                    <span class="rating">★ ${rest.rating}</span>
                    <span>${rest.deliveryTime}</span>
                </div>
            </div>
            <div class="menu-preview">
                ${menuHtml}
            </div>
        `;
        grid.appendChild(card);
    });
}

function addToCart(name, price, restaurant) {
    cart.push({ name, price, restaurant });
    updateCartUI();
    // Open cart automatically on first add
    if (cart.length === 1) {
        openCart();
    }
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;

    const container = document.getElementById('cart-items');
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
        document.getElementById('cart-total').innerText = '0.00';
        return;
    }

    let html = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        html += `
            <div class="cart-item-row">
                <div>
                    <div>${item.name}</div>
                    <div style="font-size:0.8rem; color:#888">from ${item.restaurant}</div>
                </div>
                <div>₹${item.price}</div>
            </div>
        `;
    });

    container.innerHTML = html;
    document.getElementById('cart-total').innerText = total.toFixed(2);
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');

    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    } else {
        openCart();
    }
}

function openCart() {
    document.getElementById('cart-sidebar').classList.add('open');
    document.getElementById('overlay').classList.add('open');
}

async function placeOrder() {
    if (cart.length === 0) return alert("Cart is empty!");

    const orderData = {
        item: cart.map(c => c.name).join(", "),
        total: cart.reduce((sum, item) => sum + item.price, 0)
    };

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            alert("Order Placed Successfully! Check the Order Service terminal.");
            cart = [];
            updateCartUI();
            toggleCart();
        } else {
            alert("Failed to place order.");
        }
    } catch (error) {
        alert("Error connecting to server.");
    }
}
