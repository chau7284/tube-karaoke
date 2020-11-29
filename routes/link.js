const express = require('express');
const router = express.Router();
const settings = require('../settings');
const task = require('./task');
const db = require('../mongo');

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



router.put('/update', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    var params = req.body;
    db.update(params, res);
});

//OK
router.delete('/delete', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    var params = req.body;
    db.delete(params._id, res);
});


router.get('/find-task', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    task.find(res);
});

router.get('/current-task', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    task.current(res);
});


module.exports = router;