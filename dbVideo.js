const mongoose = require('mongoose');
 
const videoSchema = new mongoose.Schema(
    {
        _id: String,
        url: String,
        name: String,
        source: String,
        duration:Number
    },
);
 
module.exports = mongoose.model('video', videoSchema);