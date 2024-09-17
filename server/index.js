require('dotenv').config({ path: '../.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const spotifyRoutes = require('./routes/spotifyRoutes');
const channelRoutes = require('./routes/channelRoutes');

const app = express();
const PORT = process.env.PORT || 5001;
const http = require('http').createServer(app);
const io = require('socket.io')(http);

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
    });

    socket.on('playback-update', (data) => {
        io.to(data.channelId).emit('playback-sync', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
