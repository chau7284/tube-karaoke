const mongoose = require('mongoose');
 
const configSchema = new mongoose.Schema(
    {
        _id: String,
        versionName: String,
        secretKey: String,
        privateKey: String,
        nextVersion: String,
        date: String,
        function: String,
        vip: Number
    },
);
 
module.exports = mongoose.model('config', configSchema);
