const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    spotifyId: String,
    title: String,
    artist: String,
    albumArt: String,
    addedBy: String,
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 }
});

const channelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    collaborators: [String],
    songs: [songSchema]
});

const Channel = mongoose.model('Channel', channelSchema);
module.exports = Channel;
