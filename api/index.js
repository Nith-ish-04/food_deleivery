const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors());

// Mock Data for Vercel Deployment (since MongoDB/Python services won't run in this environment easily)
const restaurants = [
    {
        id: 1,
        name: "Pizza Hut",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        rating: 4.5,
        deliveryTime: "30-40 mins",
        menu: [
            { id: 101, name: "Margherita Pizza", price: 250, desc: "Classic cheese pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60" },
            { id: 102, name: "Pepperoni Pizza", price: 350, desc: "Spicy pepperoni", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60" }
        ]
    },
    {
        id: 2,
        name: "Burger King",
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&auto=format&fit=crop&q=60",
        rating: 4.2,
        deliveryTime: "25-35 mins",
        menu: [
            { id: 201, name: "Whopper", price: 199, desc: "Flame grilled burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60" }
        ]
    }
];

let orders = [];

// API Routes
app.get('/api/restaurants', (req, res) => {
    res.json(restaurants);
});

app.get('/api/orders', (req, res) => {
    res.json(orders);
});

app.post('/api/orders', (req, res) => {
    const newOrder = {
        id: orders.length + 1,
        ...req.body,
        status: "Pending",
        createdAt: new Date()
    };
    orders.push(newOrder);

    // Simulate order processing
    setTimeout(() => {
        const order = orders.find(o => o.id === newOrder.id);
        if (order) order.status = "Preparing";
    }, 5000);

    setTimeout(() => {
        const order = orders.find(o => o.id === newOrder.id);
        if (order) order.status = "Ready";
    }, 10000);

    res.status(201).json(newOrder);
});

app.get('/', (req, res) => {
    res.send('Food Delivery Backend is Running on Vercel!');
});

// Export for Vercel
module.exports = app;

// Start server if run locally
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
