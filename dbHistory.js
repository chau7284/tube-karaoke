const mongoose = require('mongoose');
 
const historySchema = new mongoose.Schema(
    {
        _id: String, //key
        history:[
            {
                _id: String, //time
                day: Number,
                month: Number,
                year: Number,
                success: Number,
                error: Number
            }
        ]
    }
);
 
module.exports = mongoose.model('history', historySchema);