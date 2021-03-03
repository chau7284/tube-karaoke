const mongoose = require('mongoose');
 
const keySchema = new mongoose.Schema(
    {
        _id: String, //*
        type: String, //A:Remove Ads, D:Dropbox Link *
        value: Number, //30,60,90,120.... *
        status: Number, //0:None, 1:Used *
        phone: String, //Phone Number
        partner: String, //Id Partner,
        created: Date,
        updated: Date
    },
);
 
module.exports = mongoose.model('key', keySchema);