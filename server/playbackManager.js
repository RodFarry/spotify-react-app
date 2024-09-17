let playbackState = {};

// Function to start playing the next song in the channel's playlist
const startPlayback = (io, channel) => {
    const channelId = channel._id.toString();
    if (!playbackState[channelId]) {
        playbackState[channelId] = {
            currentSongIndex: 0,
            isPlaying: false,
            timestamp: null, // The timestamp when the song started playing
        };
    }

    if (!playbackState[channelId].isPlaying) {
        const currentSong = channel.songs[playbackState[channelId].currentSongIndex];
        playbackState[channelId].isPlaying = true;
        playbackState[channelId].timestamp = Date.now();

        // Notify all clients about the current song
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

module.exports = { playbackState, startPlayback };
