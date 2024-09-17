const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const querystring = require('querystring');
const router = express.Router();

const refreshTokens = {};

// Spotify login route
router.get('/login', (req, res) => {
    const scope = [
        'user-read-email',
        'user-read-private',
        'playlist-modify-public',
        'user-library-read',
        'user-library-modify',
        'streaming',
        'user-read-playback-state',
        'user-modify-playback-state',
    ].join(' ');

    const authURL = `https://accounts.spotify.com/authorize?${querystring.stringify({
        client_id: process.env.SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: process.env.SPOTIFY_CALLBACK_URL,
        scope,
    })}`;

    res.redirect(authURL);
});

// Spotify callback to exchange code for access and refresh tokens
router.get('/callback', async (req, res) => {
    const code = req.query.code || null;

    if (!code) {
        return res.status(400).send('Missing authorization code.');
    }

    try {
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.SPOTIFY_CALLBACK_URL,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
            },
        });

        const accessToken = tokenResponse.data.access_token;
        const refreshToken = tokenResponse.data.refresh_token;
        refreshTokens[accessToken] = refreshToken;

        const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const userProfile = profileResponse.data;

        const token = jwt.sign(
            { id: userProfile.id, displayName: userProfile.display_name, accessToken, refreshToken },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.redirect(`http://localhost:3000/callback?token=${token}`);
    } catch (error) {
        res.status(500).send('Failed to authenticate with Spotify.');
    }
});

router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'No refresh token provided' });
    }

    try {
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
            },
        });

        const newAccessToken = tokenResponse.data.access_token;
        const newExpiresIn = tokenResponse.data.expires_in;

        res.status(200).json({ newAccessToken, newExpiresIn });
    } catch (error) {
        res.status(500).json({ message: 'Failed to refresh token' });
    }
});

module.exports = router;
