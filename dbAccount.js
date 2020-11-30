const mongoose = require('mongoose');
 
const accountSchema = new mongoose.Schema(
    {
        _id: String,
        password: String,
        key: String,
        session: String,
        counter: Number,
        created: Date,
        updated: Date
       
    },
);
 
module.exports = mongoose.model('account', accountSchema);