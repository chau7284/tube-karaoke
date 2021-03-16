const express = require('express');
const router = express.Router();
const settings = require('../settings');
const task = require('./task');
const db = require('../mongo');
const firestore = require('../firestore');

/**
*  
* WORKER 
* 
*/

const auth = async (req, res, next) => {
    try {
        var token = req.headers['token'];
        var id = req.headers['id'];

        await db.select_token(id, token, user => {
            if (user == null) {
                res.json(settings.UN_TOKEN);
                res.end();
            } else
                next();
        });
    } catch (error) {
        res.json(settings.UN_TOKEN);
        res.end();
    }
}

//Get song
router.get('/get', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    /*
    *{
    * _id: videoId,
    *}
    */
    var videoId = req.query.videoId;
    db.get_song_by_id(videoId, res);
});

//Get All song
router.get('/get-all', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    db.get_all_song(res);
});

//Add song
router.post('/add', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    /*
    *{
    * _id: videoId,
    *}
    */
    var params = req.body;
    db.check_exist(params, res);
});

//Add many document
router.post('/add-many-document', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    var params = req.body;
    db.insert_many_document(params, res);
});


//Update song
router.put('/update', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    var params = req.body;
    db.update(params, res);
});

//Update song
router.put('/update-link', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    var params = req.body;
    db.check_exist_link(params, res);
});

//Delete song
router.delete('/delete', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    var params = req.body;
    db.delete(params._id, res);
});

//Delete song type 1
router.delete('/delete-type1', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    db.delete_all_type1(res);
});

//Delete song
router.delete('/delete-all-document', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
   
    db.delete_all_document(res);
});


//Get song for extract link
router.get('/find-task', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    task.find(res);
});

//Return current page
router.get('/current-task', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    task.current(res);
});

//Clear task
router.get('/clear-task', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    task.clear(res);
});

//Update Extract Error
router.post('/update-error', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    var params = req.body;

    var current = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var p = {
        "collection": "DZOLINK",
        "document": params.deviceName + "|"+ new Date().toISOString(),
        "field": {
            "videoId": params.videoId,
            "battery":params.battery,
            "ip": ip,
            "time": current
        }
    }

    firestore.insert_silent(p);
});

//Update Extract Error
router.post('/update-ban', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    var params = req.body;

    var current = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var p = {
        "collection": "BAN",
        "document": params.deviceName + "|" + new Date().toISOString(),
        "field": {
            "deviceName": params.deviceName,
            "videoId": params.videoId,
            "battery":params.battery,
            "ip": ip,
            "time": current
        }
    }

    firestore.insert_silent(p);
});

//Update Extract Error
router.post('/update-sleeping', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    var params = req.body;

    var current = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var p = {
        "collection": "SLEEPING",
        "document": params.deviceName + "|" + new Date().toISOString(),
        "field": {
            "deviceName": params.deviceName,
            "battery":params.battery,
            "ip": ip,
            "time": current
        }
    }

    firestore.insert_silent(p);
});

module.exports = router;