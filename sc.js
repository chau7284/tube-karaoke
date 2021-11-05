const axios = require('axios');
const settings = require('./settings');
const utils = require('./utils.js');
const dbSC = require('./dbSC');

//Decrapted
exports.query = async function (id, url, callback) {
    const clientId = 'YxQYlFPNletSMSZ4b8Svv9FTYgbNbM79';
    try {
        const response = await axios.get('https://api-v2.soundcloud.com/resolve?url=' + url + '&client_id=' + clientId);
        var resp = response.data;
        if (resp !== null) {
            callback(resp);
        }
    } catch (error) {
        console.error("SC-ERROR:->", error);
        callback(null);
    }
}

//OK
exports.find_by_id = function (id, callback) {
    dbSC.findOne(
        { _id: id }
    ).exec((err, data) => {
        if (!err) {
            callback(data);
        } else {
            callback(null);
        }
    });
}