const mongoose = require('mongoose');

// Sound Cloud
const scSchema = new mongoose.Schema(
    {
        _id: String,
        songid: String,
        title: String,
        userid: String,
        username: String,
        plink: String,
        artlink: String,
        wavelink: String,
        description: String,
        search: String,
        url: String
    },
);

module.exports = mongoose.model('sc', scSchema);