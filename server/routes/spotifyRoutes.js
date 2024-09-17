const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const querystring = require('querystring');
const router = express.Router();

// Mock DB for refresh tokens (you might want to store it in a real database)
const refreshTokens = {};

// Route for Spotify login (redirects to Spotify auth)
router.get('/login', (req, res) => {
    const scope = [
        'user-read-email',
        'user-read-private',
        'playlist-modify-public',
        'user-library-read',
        'user-library-modify',
        'streaming', // Required for playback
        'user-read-playback-state',
        'user-modify-playback-state' // Required for controlling playback
    ].join(' ');

    const authURL = `https://accounts.spotify.com/authorize?${querystring.stringify({
        client_id: process.env.SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: process.env.SPOTIFY_CALLBACK_URL,
        scope,
    })}`;

    res.redirect(authURL);
});

// Route to handle Spotify callback and issue JWT
router.get('/callback', async (req, res) => {
    const code = req.query.code || null;

    if (!code) {
        return res.status(400).send('Missing authorization code.');
    }

    try {
        // Exchange authorization code for access and refresh token
        const tokenResponse = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
            },
            data: querystring.stringify({
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.SPOTIFY_CALLBACK_URL,
            }),
        });

        console.log('Access token response:', tokenResponse);

        const accessToken = tokenResponse.data.access_token;
        const refreshToken = tokenResponse.data.refresh_token;

        // Store the refresh token in a mock database (you can use a real DB)
        refreshTokens[accessToken] = refreshToken;

        // Fetch user profile from Spotify
        const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const userProfile = profileResponse.data;

        // Create JWT with user profile, access token, and refresh token
        const token = jwt.sign(
            { id: userProfile.id, displayName: userProfile.display_name, accessToken, refreshToken },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Redirect to client-side app with the JWT token in the query params
        res.redirect(`http://localhost:3000/callback?token=${token}`);
    } catch (error) {
        console.error('Error exchanging authorization code:', error.message);
        res.status(500).send('Failed to authenticate with Spotify.');
    }
});

// Route to refresh Spotify access token (POST /refresh)
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'No refresh token provided' });
    }

    try {
        // Exchange refresh token for a new access token
        const tokenResponse = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
            },
            data: querystring.stringify({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
        });

        const newAccessToken = tokenResponse.data.access_token;
        const newExpiresIn = tokenResponse.data.expires_in;

        // Update the refresh token in the mock database
        refreshTokens[newAccessToken] = refreshToken;

        res.status(200).json({ newAccessToken, newExpiresIn });
    } catch (error) {
        console.error('Error refreshing token:', error.message);
        res.status(500).json({ message: 'Failed to refresh token' });
    }
});

module.exports = router;
