import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SpotifyPlayer from './SpotifyPlayer';

const Playlist = () => {
    const [accessToken, setAccessToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        axios.get('/api/spotify/token')
            .then(response => {
                if (response.data.accessToken) {
                    setAccessToken(response.data.accessToken);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            })
            .catch(err => {
                console.error('Error fetching access token:', err);
                setIsAuthenticated(false);
            });
    }, []);

    return (
        <div>
            <h2>Playlist</h2>
            {isAuthenticated ? (
                accessToken ? (
                    <SpotifyPlayer accessToken={accessToken} />
                ) : (
                    <p>Loading player...</p>
                )
            ) : (
                <p>You need to log in to access the playlist.</p>
            )}
        </div>
    );
};

export default Playlist;
