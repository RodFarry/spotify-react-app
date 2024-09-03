require('dotenv').config({ path: '../.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const spotifyRoutes = require('./routes/spotifyRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

console.log('Initializing middleware...');

// Trust first proxy (if behind a proxy)
app.set('trust proxy', 1); 

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    console.log('Before session:', req.session);
    next();
});

// Configure express-session
app.use(session({
    secret: process.env.COOKIE_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
    },
}));

app.use((req, res, next) => {
    console.log('After session:', req.session);
    next();
});

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log('Session data:', req.session);
    console.log('User:', req.user);
    next();
});

// Register Spotify routes under the /api path
app.use('/api', spotifyRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
