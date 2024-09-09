import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Corrected the import
import axios from 'axios';

const Playlist = () => {
    const [accessToken, setAccessToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        // Parse the token from the URL
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');
    
        console.log('Full URL:', window.location.href); // Log full URL for debugging
        console.log('Token found in URL:', token); // Log token to see if it exists
    
        if (token) {
            try {
                const decodedToken = jwtDecode(token); // Decode the JWT token
                console.log('Decoded Token:', decodedToken); // Log decoded token
                setAccessToken(decodedToken.accessToken); // Extract accessToken from decoded JWT
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error decoding token:', error);
                setIsAuthenticated(false);
            }
        } else {
            console.error('No token found in URL');
            setIsAuthenticated(false);
        }
    }, []);

    useEffect(() => {
        if (accessToken) {
            // Fetch user's playlists
            axios.get('https://api.spotify.com/v1/me/playlists', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            .then(response => {
                console.log('Fetched Playlists:', response.data.items);
                setPlaylists(response.data.items); // Store the playlists in state
            })
            .catch(error => {
                console.error('Error fetching playlists:', error);
            });
        } 
    }, [accessToken]);

    return (
        <div>
            <h2>Spotify Playlists</h2>
            {isAuthenticated ? (
                playlists.length > 0 ? (
                    <ul>
                        {playlists.map((playlist) => (
                            <li key={playlist.id}>
                                <a href={'#!'} target="_blank" rel="noopener noreferrer">
                                    {playlist.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Loading playlists...</p>
                )
            ) : (
                <p>You need to log in to access the playlists.</p>
            )}
        </div>
    );
};

export default Playlist;
