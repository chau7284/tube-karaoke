const mongoose = require('mongoose');
 
const userSchema = new mongoose.Schema(
    {
        _id: String,
        password: String,
        token: String,
        device: String,
        active: Number,
        key: String,
        created: Date,
        updated: Date,
        expired: Date
       
    },
);
 
module.exports = mongoose.model('user', userSchema);