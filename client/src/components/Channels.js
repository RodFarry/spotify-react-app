import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { getValidSpotifyToken } from '../utils/spotifyToken'; // Import the function

const Channels = () => {
    const [accessToken, setAccessToken] = useState(null);
    const [channels, setChannels] = useState([]);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDescription, setNewChannelDescription] = useState('');

    // Use getValidSpotifyToken to get the access token
    useEffect(() => {
        const fetchAccessToken = async () => {
            try {
                const token = await getValidSpotifyToken(); // Use getValidSpotifyToken to ensure a valid token
                setAccessToken(token);
            } catch (error) {
                console.error('Error getting valid Spotify token:', error);
            }
        };

        fetchAccessToken();
    }, []);

    // Fetch channels when the access token is available
    useEffect(() => {
        if (accessToken) {
            axios.get('http://localhost:5001/api/channels', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            })
            .then(response => {
                console.log('Fetched Channels:', response.data);
                setChannels(response.data);
            })
            .catch(error => {
                console.error('Error fetching channels:', error);
            });
        }
    }, [accessToken]);
    
    const createChannel = async () => {
        try {
            const token = await getValidSpotifyToken();
            console.log('Token used for creating channel:', token); // Log the token being used
            
            const response = await axios.post('http://localhost:5001/api/channels/create', {
                name: newChannelName,
                description: newChannelDescription,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`, // Make sure it's a valid Bearer token
                }
            });
    
            console.log('Channel created:', response.data);
            setChannels([...channels, response.data]);
    
            setNewChannelName('');
            setNewChannelDescription('');
        } catch (error) {
            console.error('Error creating channel:', error.message, error.response?.data);
        }
    };

    return (
        <div>
            <h2>Spotify Channels</h2>
            <div>
                <input
                    type="text"
                    placeholder="Channel Name"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Channel Description"
                    value={newChannelDescription}
                    onChange={(e) => setNewChannelDescription(e.target.value)}
                />
                <button onClick={createChannel}>Create Channel</button>
            </div>
            {channels.length > 0 ? (
                <ul>
                    {channels.map((channel) => (
                        <li key={channel._id}>
                            <Link to={`/channels/${channel._id}`}>
                                {channel.name} - {channel.songs.length} songs - {channel.collaborators.length} collaborators
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Loading channels...</p>
            )}
        </div>
    );
};

export default Channels;
