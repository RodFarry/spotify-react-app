const express = require('express');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const router = express.Router();

// Initialize Passport with Spotify Strategy
passport.use(
    new SpotifyStrategy(
        {
            clientID: process.env.SPOTIFY_CLIENT_ID,  // Access the client ID from environment variables
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,  // Access the client secret from environment variables
            callbackURL: process.env.SPOTIFY_CALLBACK_URL  // Access the callback URL from environment variables
        },
        function(accessToken, refreshToken, expires_in, profile, done) {
            // Save user data to DB or perform other logic
            done(null, { profile, accessToken });
        }
    )
);

// Initialize Passport middleware
router.use(passport.initialize());

// Spotify login route
router.get('/login', passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private', 'playlist-modify-public', 'user-library-read', 'user-library-modify']
}));

// Spotify callback route
router.get('/callback', passport.authenticate('spotify', { failureRedirect: '/' }), (req, res) => {
    // Successful authentication, redirect home
    res.redirect('/');
});

module.exports = router;
