const express = require('express');
const router = express.Router();

router.post('/insert-user', (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    var device = req.headers['device'];

    /**
    *  {
        "phone":"0901810481",
        "nickname":"test1",
        "password":"abc123"
    *  }
    */
    var params = req.body;

    var user = {
        "collection": settings.COLLECTION_USERS,
        "document": params.phone,
        "field": {
            "_id": params.phone,
            "device": device,
            "phone": params.phone,
            "password": params.password,
            "nickname": params.nickname,
            "point":0,
            "sub":0,
            "active": 0,
        }
    }

    //db.insert_user(user, res);

});

module.exports = router;