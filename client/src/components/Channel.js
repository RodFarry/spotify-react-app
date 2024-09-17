import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getValidSpotifyToken } from '../utils/spotifyToken';
import { io } from 'socket.io-client';

const Channel = () => {
    const { channelId } = useParams();
    const [channel, setChannel] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [query, setQuery] = useState('');
    const [queue, setQueue] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [player, setPlayer] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Establish a WebSocket connection for playback synchronization
    useEffect(() => {
        const socket = io('http://localhost:5001');

        // Join the channel room for real-time synchronization
        socket.emit('join-channel', channelId);

        socket.on('playback-update', (data) => {
            setCurrentSong(data.song);
            setElapsedTime(Date.now() - data.timestamp); // Calculate how much of the song has played
        });

        return () => {
            socket.disconnect(); // Clean up the WebSocket connection
        };
    }, [channelId]);

    // Load the Spotify Web Playback SDK and initialize the player
    useEffect(() => {
        const loadSpotifyPlayer = async () => {
            const accessToken = await getValidSpotifyToken();

            window.onSpotifyWebPlaybackSDKReady = () => {
                const spotifyPlayer = new window.Spotify.Player({
                    name: 'Spotify Web Playback SDK',
                    getOAuthToken: cb => { cb(accessToken); }
                });

                spotifyPlayer.addListener('ready', ({ device_id }) => {
                    setDeviceId(device_id);
                });

                spotifyPlayer.connect();
                setPlayer(spotifyPlayer);
            };

            const script = document.createElement('script');
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        };

        loadSpotifyPlayer();
    }, []);

    // Fetch channel details by ID
    useEffect(() => {
        const fetchChannel = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/channels/${channelId}`);
                setChannel(response.data);
            } catch (error) {
                console.error('Error fetching channel details:', error);
            }
        };

        fetchChannel();
    }, [channelId]);

    // Search for songs on Spotify
    const handleSearch = async (e) => {
        e.preventDefault();

        try {
            const spotifyAccessToken = await getValidSpotifyToken(); // Get a valid Spotify token using the helper

            const response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
                headers: {
                    Authorization: `Bearer ${spotifyAccessToken}`
                }
            });
            setSearchResults(response.data.tracks.items);
        } catch (error) {
            console.error('Error searching Spotify:', error);
        }
    };

    // Add a song to the channel
    const addSongToChannel = async (song) => {
        try {
            const spotifyAccessToken = await getValidSpotifyToken(); // Ensure valid token for this request
            await axios.post(`http://localhost:5001/api/channels/${channelId}/songs`, {
                spotifyId: song.id,
                title: song.name,
                artist: song.artists[0].name,
                albumArt: song.album.images[0].url,
                duration_ms: song.duration_ms,
            }, {
                headers: { Authorization: `Bearer ${spotifyAccessToken}` } // Use the valid token here
            });

            const updatedChannel = await axios.get(`http://localhost:5001/api/channels/${channelId}`);
            setChannel(updatedChannel.data);
        } catch (error) {
            console.error('Error adding song to channel:', error);
        }
    };

    // Handle voting for a song (upvote/downvote)
    const handleVote = async (songId, vote) => {
        try {
            const spotifyAccessToken = await getValidSpotifyToken(); // Ensure valid token for this request
            const response = await axios.post(`http://localhost:5001/api/channels/${channelId}/songs/${songId}/vote`, { vote }, {
                headers: { Authorization: `Bearer ${spotifyAccessToken}` } // Use the valid token here
            });
            setChannel(response.data); // Update the channel after voting
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    // Add a song to the queue
    const addToQueue = (song) => {
        if (!queue.includes(song)) {
            setQueue([...queue, song]);
            if (!currentSong) {
                setCurrentSong(song); // Play the first song in the queue
                playSong(song.spotifyId);
            }
        }
    };

    // Play a song using Spotify's Web Playback SDK
    const playSong = async (spotifyId, positionMs = 0) => {
        const token = await getValidSpotifyToken();
        if (!deviceId || !token) return;

        try {
            await axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                uris: [`spotify:track:${spotifyId}`],
                position_ms: positionMs,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error playing song:', error);
        }
    };

    const renderSongQueue = () => {
        if (queue.length === 0) return <p>No songs in queue.</p>;
        return (
            <div>
                <h4>Current Queue</h4>
                <ul>
                    {queue.map((song, index) => (
                        <li key={index}>{song.title} by {song.artist}</li>
                    ))}
                </ul>
            </div>
        );
    };

    if (!channel) {
        return <div>Loading channel details...</div>;
    }

    return (
        <div>
            <h2>{channel.name}</h2>
            <p>{channel.description}</p>

            <div>
                <h3>Currently Playing</h3>
                {currentSong ? (
                    <div>
                        <img
                            src={currentSong.albumArt}
                            alt={currentSong.title}
                            style={{ borderRadius: '50%', width: '100px', animation: 'spin 3s linear infinite' }}
                        />
                        <p>{currentSong.title} by {currentSong.artist}</p>
                    </div>
                ) : <p>No song playing currently.</p>}
            </div>

            <h3>Songs</h3>
            <ul>
                {channel.songs.map((song) => (
                    <li key={song._id}>
                        {song.title} by {song.artist}
                        <button onClick={() => addToQueue(song)}>Queue</button>
                        <button onClick={() => handleVote(song._id, 'up')}>👍</button>
                        <button onClick={() => handleVote(song._id, 'down')}>👎</button>
                    </li>
                ))}
            </ul>

            <div>{renderSongQueue()}</div>

            <h3>Search for Songs</h3>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search Spotify"
                />
                <button type="submit">Search</button>
            </form>

            {searchResults.length > 0 && (
                <ul>
                    {searchResults.map((song) => {
                        const alreadyAdded = channel.songs.some((s) => s.spotifyId === song.id);
                        return (
                            <li key={song.id} style={{ color: alreadyAdded ? 'grey' : 'black' }}>
                                {song.name} by {song.artists[0].name}
                                {!alreadyAdded && (
                                    <button onClick={() => addSongToChannel(song)}>Add to Channel</button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default Channel;
