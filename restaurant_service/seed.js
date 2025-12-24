const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/food_delivery_db";

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

const restaurants = [
    {
        id: 1,
        name: "Spice Villa",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80", // Restaurant ambience
        rating: 4.5,
        deliveryTime: "30-40 mins",
        menu: [
            { id: 101, name: "Butter Chicken", price: 350, desc: "Rich creamy tomato gravy with chicken", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80" },
            { id: 102, name: "Garlic Naan", price: 60, desc: "Soft indian bread with garlic", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&q=80" },
            { id: 103, name: "Paneer Tikka", price: 280, desc: "Grilled cottage cheese cubes", image: "https://images.unsplash.com/photo-1567188040754-b7917106b2f1?w=500&q=80" }
        ]
    },
    {
        id: 2,
        name: "Dosa Plaza",
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&q=80", // Restaurant
        rating: 4.3,
        deliveryTime: "20-30 mins",
        menu: [
            { id: 201, name: "Masala Dosa", price: 120, desc: "Crispy crepe with potato filling", image: "https://images.unsplash.com/photo-1589301760576-416ccd542151?w=500&q=80" },
            { id: 202, name: "Idli Sambar", price: 80, desc: "Steamed rice cakes with lentil soup", image: "https://images.unsplash.com/photo-1589301760576-416ccd542151?w=500&q=80" }
        ]
    },
    {
        id: 3,
        name: "Biryani Blues",
        image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=500&q=80", // Biryani pot
        rating: 4.7,
        deliveryTime: "40-50 mins",
        menu: [
            { id: 301, name: "Hyderabadi Chicken Biryani", price: 299, desc: "Aromatic rice with spicy chicken", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80" },
            { id: 302, name: "Mutton Biryani", price: 399, desc: "Classic mutton biryani", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80" }
        ]
    }
];

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        await Restaurant.deleteMany({});
        await Restaurant.insertMany(restaurants);
        console.log('Data Seeded Successfully');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error seeding data', err);
        mongoose.connection.close();
    });
