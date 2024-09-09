require('dotenv').config({ path: '../.env' }); // Ensure this loads your .env file

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const spotifyRoutes = require('./routes/spotifyRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

console.log('Starting application...');

// Check if JWT_SECRET is loaded properly
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined. Please set it in your .env file.');
    process.exit(1); // Exit the process if the secret is not set
} else {
    console.log('JWT_SECRET is set correctly.');
}

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api', spotifyRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
