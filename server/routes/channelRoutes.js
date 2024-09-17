const express = require('express');
const jwt = require('jsonwebtoken');
const Channel = require('../models/channel');
const { startPlayback } = require('../playbackManager');
const router = express.Router();

// Create a new channel
router.post('/create', async (req, res) => {
    const { name, description } = req.body;
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const newChannel = new Channel({
            name,
            description,
            collaborators: [decoded.id]
        });

        await newChannel.save();
        res.status(201).json(newChannel);
    } catch (error) {
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
        startPlayback(req.io, channel); // Start playback when the first user joins
        res.status(200).json({ message: 'Playback started' });
    } catch (error) {
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const channel = await Channel.findById(req.params.channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        if (channel.songs.some(song => song.spotifyId === spotifyId)) {
            return res.status(400).json({ message: 'Song already added' });
        }

        channel.songs.push({ spotifyId, title, artist, albumArt, duration_ms, addedBy: decoded.id });
        await channel.save();
        res.status(201).json(channel);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add song' });
    }
});

module.exports = router;
