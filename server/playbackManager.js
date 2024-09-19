let playbackState = {};

// Function to start playing the next song in the channel's playlist
const startPlayback = (io, channel) => {
    const channelId = channel._id.toString();

    if (!playbackState[channelId]) {
        playbackState[channelId] = {
            currentSongIndex: 0,
            isPlaying: false,
            startTime: null,
        };
    }

    if (!playbackState[channelId].isPlaying) {
        const currentSong = channel.songs[playbackState[channelId].currentSongIndex];
        playbackState[channelId].isPlaying = true;
        playbackState[channelId].startTime = Date.now();

        // Broadcast playback state to all clients in the channel
        io.to(channelId).emit('playback-update', {
            song: currentSong,
            startTime: playbackState[channelId].startTime,
        });

        // When the song finishes, move to the next one
        setTimeout(() => {
            playbackState[channelId].currentSongIndex = (playbackState[channelId].currentSongIndex + 1) % channel.songs.length;
            playbackState[channelId].isPlaying = false;
            startPlayback(io, channel);
        }, currentSong.duration_ms);
    }
};

// Function to get the current playback state for a channel
const getPlaybackState = (channelId) => {
    return playbackState[channelId];
};

module.exports = { startPlayback, getPlaybackState };
