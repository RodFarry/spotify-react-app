let playbackState = {};

const startPlayback = (io, channel) => {
    const channelId = channel._id.toString();

    if (!playbackState[channelId]) {
        playbackState[channelId] = {
            currentSongIndex: 0,
            isPlaying: false,
            timestamp: null,
        };
    }

    if (!playbackState[channelId].isPlaying) {
        const currentSong = channel.songs[playbackState[channelId].currentSongIndex];
        playbackState[channelId].isPlaying = true;
        playbackState[channelId].timestamp = Date.now();

        // Notify all clients about the current song and the elapsed time
        io.to(channelId).emit('playback-update', {
            song: currentSong,
            timestamp: playbackState[channelId].timestamp,
        });

        // When the song finishes, play the next one
        setTimeout(() => {
            playbackState[channelId].currentSongIndex = (playbackState[channelId].currentSongIndex + 1) % channel.songs.length;
            playbackState[channelId].isPlaying = false;
            startPlayback(io, channel); // Loop to the next song
        }, currentSong.duration_ms); // Use the actual song duration
    }
};

// Function to get the current playback state (for syncing)
const getPlaybackState = (channelId) => {
    return playbackState[channelId] || null;
};

module.exports = { playbackState, startPlayback, getPlaybackState };
