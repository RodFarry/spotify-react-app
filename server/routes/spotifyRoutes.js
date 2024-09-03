const express = require('express');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const router = express.Router();

passport.use(
    new SpotifyStrategy(
        {
            clientID: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            callbackURL: process.env.SPOTIFY_CALLBACK_URL,
        },
        (accessToken, refreshToken, expires_in, profile, done) => {
            console.log('Spotify strategy called');
            done(null, { profile, accessToken });
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Spotify authentication route
router.get('/login', passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private', 'playlist-modify-public', 'user-library-read', 'user-library-modify']
}));

// Spotify callback handling
router.get('/callback', (req, res, next) => {
    console.log('Callback route accessed with query:', req.query);
    console.log('Session before authentication:', req.session); // Add this
    next();
}, passport.authenticate('spotify', { failureRedirect: '/' }), (req, res) => {
    if (!req.user) {
        console.error('User not authenticated in callback');
        return res.status(500).send('Authentication error');
    }

    console.log('User authenticated, session data:', req.session); // Log session data after auth
    console.log('Authenticated user:', req.user); // Log user object

    const accessToken = req.user.accessToken;
    res.redirect(`http://localhost:3000/callback?accessToken=${accessToken}`);
});


module.exports = router;
