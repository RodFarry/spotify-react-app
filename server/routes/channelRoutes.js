const express = require('express');
const Channel = require('../models/channel');
const { getPlaybackState, startPlayback } = require('../playbackManager');
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

// Add a song to a channel
router.post('/:channelId/songs', async (req, res) => {
    const { spotifyId, title, artist, albumArt, duration_ms } = req.body;

    try {
        const channel = await Channel.findById(req.params.channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        if (channel.songs.some(song => song.spotifyId === spotifyId)) {
            return res.status(400).json({ message: 'Song already added' });
        }

        channel.songs.push({ spotifyId, title, artist, albumArt, duration_ms });
        await channel.save();

        res.status(201).json(channel);
    } catch (error) {
        console.error('Failed to add song:', error.message);
        res.status(500).json({ message: 'Failed to add song', error: error.message });
    }
});

// Get playback state (current song and start time) for a channel
router.get('/:channelId/playbackState', async (req, res) => {
    const channelId = req.params.channelId;
    
    // Fetch playback state
    const playback = getPlaybackState(channelId); // Fetch from playback manager

    if (!playback || !playback.isPlaying) {
        console.error(`No playback found for channel: ${channelId}`);
        return res.status(404).json({ message: 'No playback active for this channel.' });
    }

    try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        const currentSong = channel.songs[playback.currentSongIndex];

        return res.status(200).json({
            song: currentSong,
            startTime: playback.startTime,
        });
    } catch (error) {
        console.error(`Error fetching playback state for channel ${channelId}:`, error);
        return res.status(500).json({ message: 'Error fetching playback state' });
    }
});


// Start playback for a channel
router.post('/:channelId/initiatePlayback', async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }
        startPlayback(req.io, channel); // Initiate playback for the channel
        res.status(200).json({ message: 'Playback started' });
    } catch (error) {
        console.error('Error initiating playback:', error);
        res.status(500).json({ message: 'Error initiating playback' });
    }
});

// Upvote/Downvote a song
router.post('/:channelId/songs/:songId/vote', async (req, res) => {
    const { vote } = req.body; // 'up' or 'down'
    const { channelId, songId } = req.params;

    try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        const song = channel.songs.id(songId);
        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }

        if (vote === 'up') {
            song.votes = (song.votes || 0) + 1;
        } else if (vote === 'down') {
            song.votes = (song.votes || 0) - 1;

            // Remove song if downvotes exceed threshold
            if (song.votes <= -5) {
                song.remove();
            }
        }

        await channel.save();
        res.status(200).json(channel);
    } catch (error) {
        console.error('Failed to vote on song:', error.message);
        res.status(500).json({ message: 'Failed to vote on song', error: error.message });
    }
});

module.exports = router;
