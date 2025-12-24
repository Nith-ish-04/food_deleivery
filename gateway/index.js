const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load Balancer Configuration
const services = {
    order: ['http://localhost:5001', 'http://localhost:5002'], // Simulating multiple instances
    restaurant: ['http://localhost:6001']
};

app.get('/', (req, res) => {
    res.send('Frontend Gateway is running. Use /api/orders or /api/restaurants.');
});

let currentOrderIndex = 0;

// Simple Round-Robin Load Balancer for Order Service
const getOrderServiceUrl = () => {
    const url = services.order[currentOrderIndex];
    currentOrderIndex = (currentOrderIndex + 1) % services.order.length;
    return url;
};

// Gateway Routes
app.get('/api/orders', async (req, res) => {
    try {
        const serviceUrl = getOrderServiceUrl();
        console.log(`[Gateway] Routing to Order Service: ${serviceUrl}`);
        const response = await axios.get(`${serviceUrl}/orders`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Order Service Unavailable' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const serviceUrl = getOrderServiceUrl();
        console.log(`[Gateway] Routing to Order Service: ${serviceUrl}`);
        const response = await axios.post(`${serviceUrl}/orders`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Order Service Unavailable' });
    }
});

app.get('/api/restaurants', async (req, res) => {
    try {
        // Random Load Balancing for Restaurant Service (if we had multiple)
        const serviceUrl = services.restaurant[Math.floor(Math.random() * services.restaurant.length)];
        console.log(`[Gateway] Routing to Restaurant Service: ${serviceUrl}`);
        const response = await axios.get(`${serviceUrl}/restaurants`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Restaurant Service Unavailable' });
    }
});

app.listen(PORT, () => {
    console.log(`Frontend Gateway running on port ${PORT}`);
});
