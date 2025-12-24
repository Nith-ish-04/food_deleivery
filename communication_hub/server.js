const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 4000;

app.use(express.json());

// Subscribers list: { "channel_name": ["http://service-url/notify"] }
const subscribers = {};

app.post('/subscribe', (req, res) => {
    const { service, url } = req.body;
    if (!subscribers['orders']) {
        subscribers['orders'] = [];
    }
    // Simple logic: all services subscribe to 'orders' channel for this demo
    if (!subscribers['orders'].includes(url)) {
        subscribers['orders'].push(url);
        console.log(`[Hub] Service ${service} subscribed to orders at ${url}`);
    }
    res.sendStatus(200);
});

app.post('/publish', async (req, res) => {
    const { channel, message } = req.body;
    console.log(`[Hub] Received message on channel ${channel}: ${message}`);

    if (subscribers[channel]) {
        subscribers[channel].forEach(async (url) => {
            try {
                console.log(`[Hub] Forwarding to ${url}`);
                await axios.post(url, { channel, message });
            } catch (error) {
                console.error(`[Hub] Failed to send to ${url}`);
            }
        });
    }
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Communication Hub running on port ${PORT}`);
});
