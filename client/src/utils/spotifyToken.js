import axios from 'axios';

export const getValidSpotifyToken = async () => {
    const tokenData = JSON.parse(localStorage.getItem('spotifyTokenData'));

    if (!tokenData) {
        throw new Error('No token found in localStorage');
    }

    const { accessToken, refreshToken, expiresAt } = tokenData;
    const currentTime = new Date().getTime();

    if (currentTime < expiresAt) {
        // console.log('Returning access token:', accessToken);
        return accessToken;
    }

    try {
        const response = await axios.post('http://localhost:5001/api/refresh', { refreshToken });
        const { newAccessToken, newExpiresIn } = response.data;

        const newTokenData = {
            accessToken: newAccessToken,
            refreshToken,
            expiresAt: new Date().getTime() + newExpiresIn * 1000,
        };

        localStorage.setItem('spotifyTokenData', JSON.stringify(newTokenData));

        return newAccessToken;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw new Error('Failed to refresh token');
    }
};
