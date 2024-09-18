require('dotenv').config({ path: '../.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const spotifyRoutes = require('./routes/spotifyRoutes');
const channelRoutes = require('./routes/channelRoutes');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { getPlaybackState } = require('./playbackManager');

const app = express();
const PORT = process.env.PORT || 5001;
const httpServer = createServer(app);

// Set up Socket.IO with CORS configuration
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Database connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', spotifyRoutes);
app.use('/api/channels', channelRoutes);

// WebSockets for real-time synchronization
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join-channel', (channelId) => {
        socket.join(channelId);
        console.log(`User joined channel ${channelId}`);

        // Sync the current playback state for the new user
        const playbackState = getPlaybackState(channelId);
        if (playbackState) {
            const currentSong = playbackState.currentSongIndex;
            const elapsedTime = Date.now() - playbackState.timestamp;

            socket.emit('sync-playback', {
                song: currentSong,
                elapsedTime,
            });
        }
    });

    socket.on('playback-update', (data) => {
        io.to(data.channelId).emit('playback-sync', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
