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

//Delete song
router.delete('/delete-type1', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    db.delete_all_type1(res);
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
        "collection": params.deviceName,
        "document": params.videoId + "|"+ new Date().toISOString(),
        "field": {
            "battery":params.battery,
            "ip": ip,
            "time": current
        }
    }

    firestore.insert_silent(p);
});

module.exports = router;