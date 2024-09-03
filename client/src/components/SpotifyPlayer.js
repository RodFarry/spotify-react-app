import React, { useEffect, useState } from 'react';

const SpotifyPlayer = ({ accessToken }) => {
    const [player, setPlayer] = useState(null);
    const [deviceId, setDeviceId] = useState(null);

    useEffect(() => {
        // Load Spotify Web Playback SDK script dynamically
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;

        document.body.appendChild(script);

        // Wait for Spotify SDK to load
        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'React Spotify Player',
                getOAuthToken: cb => { cb(accessToken); }, // Use the access token to authorize the player
                volume: 0.5
            });

            setPlayer(player);

            // Player event listeners
            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                setDeviceId(device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', (state) => {
                console.log('Player State Changed:', state);
            });

            player.connect();
        };

        // Cleanup function to remove player instance on component unmount
        return () => {
            if (player) {
                player.disconnect();
            }
        };
    }, [accessToken]);

    return (
        <div>
        <h3>Spotify Player</h3>
        {/* Add more player controls or display current track info here if needed */}
        </div>
    );
};

export default SpotifyPlayer;
