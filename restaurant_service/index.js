const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const app = express();
const PORT = 6001;

app.use(express.json());

const COMM_HUB_URL = "http://localhost:4000";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/food_delivery_db";

// Mongoose Schema
const restaurantSchema = new mongoose.Schema({
    id: Number,
    name: String,
    image: String,
    rating: Number,
    deliveryTime: String,
    menu: [{
        id: Number,
        name: String,
        price: Number,
        desc: String,
        image: String
    }]
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ CRITICAL: Could not connect to MongoDB', err);
        console.error('   Make sure MongoDB is running on localhost:27017');
    });

app.get('/restaurants', async (req, res) => {
    try {
        const restaurants = await Restaurant.find({}, { _id: 0, __v: 0 });
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch restaurants" });
    }
});

// Endpoint to receive messages from Hub
app.post('/notify', (req, res) => {
    const { channel, message } = req.body;
    console.log(`[Restaurant Service] Received Order ID: ${message}`);

    // Simulate Cooking Process
    if (channel === 'orders') {
        const orderId = message;
        console.log(`👨‍🍳 Starting to cook Order ${orderId}...`);

        setTimeout(async () => {
            console.log(`✅ Order ${orderId} is Ready! Notifying Hub...`);
            try {
                await axios.post(`${COMM_HUB_URL}/publish`, {
                    channel: 'order-updates',
                    message: `${orderId}:Ready`
                });
            } catch (e) {
                console.error("Failed to notify Hub about ready order");
            }
        }, 10000); // 10 seconds cooking time
    }

    res.sendStatus(200);
});

app.get('/notify', (req, res) => {
    res.send('Notification endpoint is active. Use POST to send notifications.');
});

// Register with Communication Hub on startup
const registerService = async () => {
    try {
        // Subscribe to 'orders' channel
        await axios.post(`${COMM_HUB_URL}/subscribe`, {
            service: "restaurant",
            url: `http://localhost:${PORT}/notify`
        });
        console.log("Registered with Communication Hub");
    } catch (error) {
        console.error("Failed to register with Communication Hub");
    }
};

app.listen(PORT, async () => {
    console.log(`Restaurant Service running on port ${PORT}`);
    setTimeout(registerService, 2000);
});
