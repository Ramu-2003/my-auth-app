const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import the router from the routes folder
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use the authentication routes
// All routes inside authRoutes will be prefixed with /api (e.g., /api/register)
// Use Google DNS servers (8.8.8.8) to bypass NodeJS dns resolution timeout for MongoDB SRV records
require('dns').setServers(['8.8.8.8', '8.8.4.4']);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => {
        console.error("MongoDB Connection Error Details:", err.message);
        console.error(err);
        process.exit(1);
    });

// Basic Root Route for testing
app.get('/', (req, res) => {
    res.send("Authentication Server is Running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
