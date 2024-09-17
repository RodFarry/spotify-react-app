import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link for navigation

const Channels = () => {
    const [accessToken, setAccessToken] = useState(null);
    const [channels, setChannels] = useState([]);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDescription, setNewChannelDescription] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('spotifyToken');
    
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                console.log('Decoded Token:', decodedToken);
                setAccessToken(decodedToken.accessToken);
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        } else {
            console.error('No token found in localStorage');
        }
    }, []);

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
        const token = localStorage.getItem('spotifyToken');
        
        if (!token) {
            console.error('No token found in localStorage');
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:5001/api/channels/create', {
                name: newChannelName,
                description: newChannelDescription,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
    
            console.log('Channel created:', response.data);
    
            // Add the new channel to the state
            setChannels([...channels, response.data]);
    
            // Clear the input fields
            setNewChannelName('');
            setNewChannelDescription('');
        } catch (error) {
            console.error('Error creating channel:', error.message, error.response?.data); // Log error details
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
