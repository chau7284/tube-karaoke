const express = require('express');
const router = express.Router();
const settings = require('../settings');
const firestore = require('../firestore');
const utils = require('../utils');
const dbUser = require('../dbUser');
const e = require('express');

const auth = async (req, res, next) => {
    try {

        var sess = req.headers['session'];
        var id = req.headers['id'];

        await dbUser.findOne(
            { _id: id, session: sess }
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
    if (user.expired == undefined) u.expired = new Date();
    var expired = user.expired.getTime();
    var current = new Date().getTime();

    if (current > expired) {
        user.active = 0;
        user.save();
    }
}

router.post('/signup', (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    /**
    *  {
        "_id":"device",
        "password":"device",
    *  }
    */
    var params = req.body;
    var account = {
        "_id": params._id,
        "password": params.password,
        "name": params._id,
        "active": 0,
        "created": new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
    }

    try {
        dbUser.create(
            account
            ,
            (err, user) => {
                if (!err) {
                    res.json(user);
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

router.post('/signin', (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    /**
    *  {
        "_id":"device",
        "password":"device"
    *  }
    */
    var params = req.body;

    try {
        dbUser.findOne(
            params
        ).exec((error, user) => {
            if (!error) {
                if (user) {
                    var session = utils.createToken();
                    user.session = session;
                    user.save();
                    res.json(user);
                    res.end();
                } else {
                    res.json(settings.UN_USER);
                    res.end();
                }
            } else {
                res.json(settings.ERROR);
                res.end();
            }
        });
    } catch (ex) {
        res.json(settings.ERROR);
        res.end();
    }

});

router.put('/update', auth, (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    /**
    *  {
        "_id":"0901810481",
        "active": 1
    *  }
    */
    var params = req.body;

    try {
        dbUser.updateOne(
            {
                _id: params._id
            },
            params
        ).exec((err, result) => {
            if (!err) {
                //Find User
                dbUser.findOne(
                    {
                        _id: params._id
                    }
                ).exec((err, user) => {
                    if (!err) {
                        res.json(user);
                        res.end();
                    } else {
                        res.json(settings.ERROR);
                        res.end();
                    }
                });
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

router.delete('/delete', auth, (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    var id = req.query._id;

    try {
        dbUser.deleteOne(
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
})

router.delete('/deletes', auth, (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    try {
        dbUser.deleteMany(
            {
                active: 0
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
})

router.put('/active', auth, (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    /**
    *  {
        "name" : "0901810481"
        "active": 1,
        "expired": 30
    *  }
    */
    var params = req.body;
    try {
        dbUser.findOne(
            {
                _id: params.name
            }
        ).exec((err, user) => {
            if (!err) {
                var newDate = new Date();
                if (user.expired == undefined) u.expired = newDate;
                var expired = user.expired.getTime();
                var current = newDate.getTime();
            
                if (current > expired) {                   
                    newDate.setDate(newDate.getDate() + params.expired);
                    user.expired = newDate;
                }else{
                     var oldDate = user.expired;
                     oldDate.setDate(oldDate.getDate() + params.expired)   
                }

                user.active = 1;
                user.save();
                res.json(user);
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

/*
* App Config
*/
router.get("/app-config", (req, res) => {
    if (req.headers['secret'] !== "kingpes") {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    res.json(
        {
            "versionName": "1.0.0",
            "secretKey": settings.SECRET,
            "privateKey": settings.KEY,
            "nextVersion": ""
        }
    );
});

/*
* Vip User
*/
router.get("/get-vip-info", (req, res) => {
    if (req.headers['secret'] !== "kingpes") {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

});

/*
* Vip User
*/
router.post("/set-vip-info", (req, res) => {
    if (req.headers['secret'] !== "kingpes") {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }


});

module.exports = router;