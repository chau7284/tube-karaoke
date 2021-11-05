const mongoose = require('mongoose');

// Video Dropbox
const videoSchema = new mongoose.Schema(
    {
        _id: String,
        url: String,
        name: String,
        source: String,
        duration: Number,
        channel: String
    },
);

module.exports = mongoose.model('video', videoSchema);