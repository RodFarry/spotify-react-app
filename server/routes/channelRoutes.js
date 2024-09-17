const express = require('express');
const jwt = require('jsonwebtoken');
const Channel = require('../models/channel');
const { startPlayback } = require('../playbackManager');
const router = express.Router();

// Get all channels
router.get('/', async (req, res) => {
    try {
        const channels = await Channel.find();
        res.status(200).json(channels);
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({ message: 'Error fetching channels' });
    }
});

// Create a new channel
router.post('/create', async (req, res) => {
    const { name, description } = req.body;
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    console.log('Received Spotify access token:', token);

    try {
        const newChannel = new Channel({
            name,
            description,
            collaborators: []
        });

        await newChannel.save();
        res.status(201).json(newChannel);
    } catch (error) {
        console.error('Error creating channel:', error.message);
        res.status(500).json({ message: 'Failed to create channel' });
    }
});


// Get a single channel by ID
router.get('/:channelId', async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }
        res.status(200).json(channel);
    } catch (error) {
        console.error('Error fetching channel:', error);
        res.status(500).json({ message: 'Error fetching channel' });
    }
});

// Start playback
router.post('/:channelId/initiatePlayback', async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }
        startPlayback(req.io, channel);
        res.status(200).json({ message: 'Playback started' });
    } catch (error) {
        console.error('Error initiating playback:', error);
        res.status(500).json({ message: 'Error initiating playback' });
    }
});

// Add a song to a channel
router.post('/:channelId/songs', async (req, res) => {
    const { spotifyId, title, artist, albumArt, duration_ms } = req.body;
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Find the channel by ID
        const channel = await Channel.findById(req.params.channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        // Check if the song already exists in the channel
        if (channel.songs.some(song => song.spotifyId === spotifyId)) {
            return res.status(400).json({ message: 'Song already added' });
        }

        // Add the new song to the channel's songs list
        channel.songs.push({ spotifyId, title, artist, albumArt, duration_ms });
        await channel.save();

        // Return the updated channel
        res.status(201).json(channel);
    } catch (error) {
        console.error('Failed to add song:', error.message);
        res.status(500).json({ message: 'Failed to add song', error: error.message });
    }
});


module.exports = router;
