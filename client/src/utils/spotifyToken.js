import axios from 'axios';

// Utility function to get a valid Spotify token
export const getValidSpotifyToken = async () => {
    const tokenData = JSON.parse(localStorage.getItem('spotifyTokenData'));

    if (!tokenData) {
        throw new Error('No token found in localStorage');
    }

    const { accessToken, refreshToken, expiresAt } = tokenData;
    const currentTime = new Date().getTime();

    // If the token is still valid, return it
    if (currentTime < expiresAt) {
        return accessToken;
    }

    // Otherwise, refresh the token
    try {
        const response = await axios.post('http://localhost:5001/api/refresh', { refreshToken });
        const { newAccessToken, newExpiresIn } = response.data;

        const newTokenData = {
            accessToken: newAccessToken,
            refreshToken,
            expiresAt: new Date().getTime() + newExpiresIn * 1000, // expiresIn is in seconds
        };

        localStorage.setItem('spotifyTokenData', JSON.stringify(newTokenData));

        return newAccessToken;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw new Error('Failed to refresh token');
    }
};
