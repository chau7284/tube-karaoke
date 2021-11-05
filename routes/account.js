const express = require('express');
const router = express.Router();
const settings = require('../settings');
const utils = require('../utils');
const dbAccount = require('../dbAccount');

/**
*  
* GET LINK API KEY 
* 
*/

const auth = async (req, res, next) => {
    try {

        var sess = req.headers['session'];
        var id = req.headers['id'];

        await dbAccount.findOne(
            { _id: id, session: sess }
        ).exec((error, user) => {
            if (!error) {
                if (user == null) {
                    res.json(settings.UN_TOKEN);
                    res.end();
                } else {
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

//Create Key
router.post('/signup', (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    /**
    *  {
        "_id":"0901810481",
        "password":"abs123",
    *  }
    */
    var params = req.body;
    var key = utils.createToken();
    var account = {
        "_id": params._id,
        "password": params.password,
        "key": key,
        "counter": 1000000,
        "created": new Date()
    }

    try {
        dbAccount.create(
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

//
router.post('/signin', (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    /**
    *  {
        "_id":"0901810481",
        "password":"abs123"
    *  }
    */
    var params = req.body;

    try {
        dbAccount.findOne(
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

//Update Key
router.put('/update', (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    /**
    *  {
        "_id":"0901810481",
        "counter": 10
    *  }
    */
    var params = req.body;

    try {
        dbAccount.updateOne(
            {
                _id: params._id
            },
            params
        ).exec((err, result) => {
            if (!err) {
                //Find User
                dbAccount.findOne(
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

//Get All Key
router.get('/selects', (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    try {
        dbAccount.find(
        ).exec((err, acc) => {
            if (!err && acc) {
                res.json(acc);
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

//Get Key Detail With Validate
router.get('/info', auth, (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    var k = req.query.key;

    try {
        dbAccount.findOne(
            {
                key: k
            }
        ).exec((err, acc) => {
            if (!err && acc) {
                res.json(acc);
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

//Get Key Detail Without Validate
router.get('/key-info', (req, res) => {

    var k = req.query.key;

    try {
        dbAccount.findOne(
            {
                key: k
            }
        ).exec((err, acc) => {
            if (!err && acc) {
                res.json({ "counter": acc.counter });
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

module.exports = router;