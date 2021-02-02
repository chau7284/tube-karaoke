const express = require('express');
const router = express.Router();
const settings = require('../settings');
const firestore = require('../firestore');
const utils = require('../utils');
const dbUser = require('../dbUser');
const dbConfig = require('../dbConfig');

/**
*  
* DZOKARA 
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
    var id = utils.createId();
    var params = req.body;
    var account = {
        "_id": id,
        "password": params.password,
        "device": params._id,
        "active": 0,
        "created": new Date()
    }

    try {
        dbUser.create(
            account
            ,
            (err, user) => {
                if (!err) {
                    var session = utils.createToken();
                    user.token = session;
                    user.save();
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
        "device":"device",
        "password":"device"
    *  }
    */
    var params = req.body;

    try {
        dbUser.findOne(
            {
                _id: params._id,
                device: params.device
            }
        ).exec((error, user) => {
            if (!error) {
                if (user) {
                    var session = utils.createToken();
                    user.token = session;
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
    params.updated = new Date();

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

    var id = req.query.id;

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

router.get('/selects', auth, (req, res) => {
    var page = req.query.page;
    var limit = req.query.limit;
    dbUser.find()
        .limit(parseInt(limit))
        .skip(parseInt(page))
        .exec((error, users) => {
            if (!error) {
                res.json(users);
                res.end();
            } else {
                res.json(settings.ERROR);
                res.end();
            }
        });
})

router.get('/select', auth, (req, res) => {
    var id = req.query.id;
    dbUser.findOne(
        {
            _id: id
        }
    ).exec((error, user) => {
        if (!error) {
            res.json(user);
            res.end();
        } else {
            res.json(settings.ERROR);
            res.end();
        }
    });
})

router.put('/active', auth, (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    /**
    *  {
        "_id" : ""
        "active": 1,
        "expired": 30
    *  }
    */
    var params = req.body;
    try {
        dbUser.findOne(
            {
                _id: params._id
            }
        ).exec((err, user) => {
            if (!err && user) {
                var newDate = new Date();
                if (user.expired == undefined) user.expired = newDate;
                var expired = user.expired.getTime();
                var current = newDate.getTime();

                if (current > expired) {
                    newDate.setDate(newDate.getDate() + Number(params.expired));
                    user.expired = newDate;
                } else {
                    var oldDate = user.expired;
                    oldDate.setDate(oldDate.getDate() + Number(params.expired));
                    user.expired = new Date(oldDate);
                }

                user.active = params.active;
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
* Apk
*/
router.get('/download/apk', (req, res) => {
    res.download('./apk/dzokara.apk');
});

/*
* App Config
*/
router.post("/app-config", (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    var config = {
        "_id": "app-config",
        "versionName": "1.0.9",
        "newVersion": "1.0.10",
        "date": "10/01/2021",
        "function": "Sửa lỗi hệ thống",
        "secretKey": settings.SECRET,
        "privateKey": settings.KEY,
        "nextVersion": "",
        "vip": 1 //1 : All Vip, 0: All Limit
    }

    try {
        dbConfig.create(
            config
            ,
            (err, c) => {
                if (v !== undefined) {
                    res.json(c);
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

router.get("/app-config", (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    dbVideo.findOne(
        {
            _id: "app-config"
        }
    ).exec((error, c) => {
        if (!error) {
            res.json(c);
            res.end();
        } else {
            res.json(settings.ERROR);
            res.end();
        }
    });
});

router.put("/update-config", (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    var params = req.body;

    try {
        dbConfig.updateOne(
            {
                _id: "app-config"
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
});

/*
* Vip User
*/
router.get("/get-packages", (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    var p = {
        "collection": "package",
    }
    firestore.gets(p, res)
});

/*
* Vip User
*/
router.post("/set-package", (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    /**
    *  {
        "_id" : ""
        "description": 1,
        "value": 30
    *  }
    */

    var params = req.body;

    var p = {
        "collection": "package",
        "document": params._id,
        "field": {
            "title": params.title,
            "content": params.content,
            "contact": params.contact
        }
    }

    firestore.insert(p, res);

});

module.exports = router;