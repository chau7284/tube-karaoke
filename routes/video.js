const express = require('express');
const router = express.Router();
const settings = require('../settings');
const dbUser = require('../dbUser');
const dbVideo = require('../dbVideo');

/**
*  
* DROPBOX
* 
*/

const auth = async (req, res, next) => {
    try {

        var tk = req.headers['token'];
        var id = req.headers['id'];

        await dbUser.findOne(
            { _id: id, token: tk }
        ).exec((error, user) => {
            if (!error) {
                if (user == null) {
                    res.json(settings.UN_TOKEN);
                    res.end();
                } else {
                    checkExpired(user);
                    next();
                }
            } else {
                res.json(settings.ERROR);
                res.end();
            }
        });

    } catch (error) {
        res.json(settings.ERROR);
        res.end();
    }
}

const checkExpired = async (user) => {
    if (user.expired == undefined) user.expired = new Date();
    var expired = user.expired.getTime();
    var current = new Date().getTime();

    if (current > expired) {
        user.active = 0;
        user.save();
    }
}

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
    var video = {
        "_id": params._id,
        "url": params.url
    }

    try {
        dbVideo.create(
            video
            ,
            (err, v) => {
                if (v !== undefined) {
                    res.json(v);
                    res.end();
                } else {
                    console.log("A");
                    res.json(settings.ERROR);
                    res.end();
                }
            }
        );
    } catch (e) {
        console.log("B");
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
        "_id":"videoId"
    *  }
    */
   var id = req.query._id;

   try {
       dbVideo.deleteOne(
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
        "_id":"videoId",
        "name": "video name"
    *  }
    */
    var params = req.body;

    try {
        dbVideo.updateOne(
            {
                _id: params._id
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

router.get('/find', auth, (req, res) => {
    var id = req.query._id;
    dbVideo.findOne(
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
    dbVideo.find()
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