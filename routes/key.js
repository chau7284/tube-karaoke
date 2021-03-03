const express = require('express');
const router = express.Router();
const settings = require('../settings');
const utils = require('../utils');
const dbKey = require('../dbKey');
const dbUser = require('../dbUser');

/**
*  
* ACTIVE CODE 
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

router.post('/create', (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    /**
    *  {
        "type":"A|D",
        "value":"30,60,90...", //day
    *  }
    */
    var id = utils.createKey();
    var params = req.body;
    var key = {
        "_id": params.type + id,
        "type": params.type,
        "value": params.value,
        "status": 0,
        "created": new Date()
    }

    try {
        dbKey.create(
            key
            ,
            (err, k) => {
                if (!err) {
                    res.json(k);
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

//Update Parnert,...
router.put('/update', (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    /**
    *  {
        "_id":"key",
        "partner":"partner id"
        .
        .
    *  }
    */
    var params = req.body;

    try {
        dbKey.updateOne(
            {
                _id: params._id
            },
            params
        ).exec((error, k) => {
            if (!error) {
                res.json(k);
                res.end();
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

//Get By Id
router.get('/select-by-partner', (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    var id = req.query.partner;
    dbKey.find(
        {
            partner: id
        }
    ).exec((error, k) => {
        if (!error) {
            res.json(k);
            res.end();
        } else {
            res.json(settings.ERROR);
            res.end();
        }
    });
})

//Get By Id
router.get('/select', (req, res) => {
    var id = req.query._id;
    dbKey.findOne(
        {
            _id: id
        }
    ).exec((error, k) => {
        if (!error) {
            res.json(k);
            res.end();
        } else {
            res.json(settings.ERROR);
            res.end();
        }
    });
})

//Get All
router.get('/selects', (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    var page = req.query.page;
    var limit = req.query.limit;
    var tpe = req.query.type; //A|D
    dbKey.find(
        {
            type: tpe
        }
    )
        .limit(parseInt(limit))
        .skip(parseInt(page))
        .exec((error, ks) => {
            if (!error) {
                res.json(ks);
                res.end();
            } else {
                res.json(settings.ERROR);
                res.end();
            }
        });
})

//Delete By Id
router.delete('/delete', auth, (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    var id = req.query._id;

    try {
        dbKey.deleteOne(
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

//Delete All
router.delete('/deletes', auth, (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    try {
        dbKey.deleteMany(
            {
                status: 0
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

//Active
router.put('/active', auth, (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    /**
    *  {
        "_id" : "userId",
        "key": "A...",
        "phone": "0901234567"
    *  }
    */
    var params = req.body;
    try {
        dbKey.findOne(
            {
                _id: params.key
            }
        ).exec((err, k) => {
            if (!err && k) {
                if (k.status === 0) {
                    console.log("KEY_AVAILABLE");
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
                                newDate.setDate(newDate.getDate() + Number(k.value));
                                user.expired = newDate;
                            } else {
                                var oldDate = user.expired;
                                oldDate.setDate(oldDate.getDate() + Number(k.value));
                                user.expired = oldDate;
                            }
                            user.active = 1;
                            user.key = params.key;
                            user.save();
                            res.json(user);
                            res.end();
                            

                            //Update key
                            k.status = 1;
                            k.updated = new Date();
                            k.phone = params.phone;
                            k.save();
                        } else {
                            res.json(settings.ERROR);
                            res.end();
                        }
                    });
                } else {
                    console.log("KEY_USED");
                    if(k.phone === params.phone){
                        console.log("KEY_SAME_PHONE");
                        dbUser.findOne(
                            {
                                key: params.key
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
                    }else{
                        console.log("KEY_OTHER_PHONE");
                        res.json(settings.KEY_INCORRECT);
                        res.end();
                    }
                }
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




module.exports = router;