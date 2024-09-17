// server/routes/channelRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Channel = require('../models/channel');
const router = express.Router();

// Create a new channel
router.post('/create', async (req, res) => {
    const { name, description } = req.body;
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Extract Bearer token

    try {
        // Decode JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded);

        // Create a new channel
        const newChannel = new Channel({
            name,
            description,
            collaborators: [decoded.id] // Add user as collaborator
        });

        // Save to database
        await newChannel.save();
        console.log('Channel created successfully:', newChannel);

        res.status(201).json(newChannel);
    } catch (error) {
        console.error('Error creating channel:', error.message, error.stack);
        res.status(500).json({ message: 'Failed to create channel', error: error.message });
    }
});

// Get all channels
router.get('/', async (req, res) => {
    try {
        const channels = await Channel.find();
        res.status(200).json(channels);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching channels' });
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

// Add a song to a channel
router.post('/:channelId/songs', async (req, res) => {
    const { spotifyId, title, artist, albumArt } = req.body;
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

        channel.songs.push({ spotifyId, title, artist, albumArt, addedBy: decoded.id });
        await channel.save();

        res.status(201).json(channel);
    } catch (error) {
        console.error('Failed to add song:', error.message, error.stack);
        res.status(500).json({ message: 'Failed to add song', error: error.message });
    }
});

module.exports = router;
