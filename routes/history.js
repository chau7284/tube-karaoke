const express = require('express');
const router = express.Router();
const settings = require('../settings');
const dbHistory = require('../dbHistory');

router.get("/find-history", async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    //id = phone
    var key = req.query.key;
    var month = req.query.month;

    await dbHistory.find(
        {
            _id:key
        }
    )
        .exec((error, h) => {
            if (!error) {
                console.log('<<<<<-FIND-HISTORY: >>>>>month:' + month);
                res.json(h);
                res.end();
            } else {
                res.json(settings.ERROR);
                res.end();
            }
        });
});

router.put("/delete-history-by-month", async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    var key = req.query.key;
    var month = req.query.month;

    try {
        await dbHistory.updateOne(
            {
                _id: key
            }
            ,
            {
                $pull: { "history": { "month": month } }
            }
            ,
            (err, result) => {
                console.log('<<<<<-DELETE-HISTORY: >>>>>month:' + month);
                res.json(result);
                res.end();
            }
        );
    } catch (err) {
        res.json(settings.ERROR);
        res.end();
    }
});

module.exports = router;