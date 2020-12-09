const mongoose = require('mongoose');
 
const userSchema = new mongoose.Schema(
    {
        _id: String,
        password: String,
        name: String,
        session: String,
        active: Number,
        created: Date,
        updated: Date,
        expired: Date
       
    },
);
 
module.exports = mongoose.model('user', userSchema);