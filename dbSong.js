const mongoose = require('mongoose');
 
const songSchema = new mongoose.Schema(
    {
        _id: String, //videoId,
        counter: Number,
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
        ]
    },
);
 
module.exports = mongoose.model('song', songSchema);