const mongoose = require('mongoose');

//Youtube Newpie
const songSchema = new mongoose.Schema(
    {
        _id: String, //videoId,
        counter: Number,
        type: Number,
        video: [
            {
                _id: String,
                url: String
            }
        ],
        audio: [
            {
                _id: String,
                url: String
            }
        ],
        mix: [
            {
                _id: String,
                url: String
            }
        ]
    },
);

module.exports = mongoose.model('song', songSchema);