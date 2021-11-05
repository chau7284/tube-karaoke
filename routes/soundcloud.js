const express = require('express');
const router = express.Router();
const settings = require('../settings');
const sc = require('../sc');



router.post('/add', (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    /**
    *  {
        "_id":"videoId",
        "url":"link",
    *  }
    */
    var params = req.body;
    params._id = params.songid;

    try {
        sc.create(
            params
            ,
            (err, v) => {
                if (v !== undefined) {
                    res.json(v);
                    res.end();
                } else {
                    res.json(settings.ERROR);
                    res.end();
                }
            }
        );
    } catch (e) {
        res.json(settings.ERROR);
        res.end();
    }

});

router.delete('/delete', (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    /**
    *  {
        "songid":"id"
    *  }
    */
    var id = req.query.songid;

    try {
        sc.deleteOne(
            {
                _id: id
            }
        ).exec((err, result) => {
            if (!err) {
                res.json(result);
                res.end();
            } else {
                res.json(settings.ERROR);
                res.end();
            }
        });
    } catch (e) {
        res.json(settings.ERROR);
        res.end();
    }
});


router.put('/update', (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    /**
    *  {
        "_id":"songid",
        ......
    *  }
    */
    var params = req.body;

    try {
        sc.updateOne(
            {
                _id: params.songid
            },
            params
        ).exec((err, result) => {
            if (!err) {
                res.json(result);
                res.end();
            } else {
                res.json(settings.ERROR);
                res.end();
            }
        });
    } catch (e) {
        res.json(settings.ERROR);
        res.end();
    }
})


router.get('/find', (req, res) => {
    var id = req.query.songid;
    sc.findOne(
        {
            _id: id
        }
    ).exec((error, v) => {
        if (!error) {
            res.json(v);
            res.end();
        } else {
            res.json(settings.ERROR);
            res.end();
        }
    });
})

router.get('/selects', (req, res) => {
    var page = req.query.page;
    var limit = req.query.limit;
    sc.find()
        .limit(parseInt(limit))
        .skip(parseInt(page))
        .exec((error, videos) => {
            if (!error) {
                res.json(videos);
                res.end();
            } else {
                res.json(settings.ERROR);
                res.end();
            }
        });
})

module.exports = router;