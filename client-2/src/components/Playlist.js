import React, { useState, useEffect } from 'react';
import SpotifyPlayer from './SpotifyPlayer';
import axios from 'axios';

const Playlist = () => {
    const [accessToken, setAccessToken] = useState(null);
    const [playlistId, setPlaylistId] = useState(null); // Replace with actual playlist ID or logic

    useEffect(() => {
        // Fetch the Spotify access token from your backend (using your backend's API route)
        axios.get('/api/spotify/token')
        .then(response => {
            setAccessToken(response.data.accessToken);
        })
        .catch(err => console.error(err));
    }, []);

    return (
        <div>
        <h2>Playlist</h2>
        {accessToken ? (
            <SpotifyPlayer accessToken={accessToken} playlistId={playlistId} />
        ) : (
            <p>Loading player...</p>
        )}
        </div>
    );
};

export default Playlist;
