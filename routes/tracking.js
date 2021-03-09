const express = require('express');
const router = express.Router();
const settings = require('../settings');
const firestore = require('../firestore');
const utils = require('../utils');

router.post("/add", (req, res) => {
    if (req.headers['secret'] !== "dzokara") {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    /**
    *  {
        "serial" : ""
        "videoId": 1,
        "type": "",
        "time":
    *  }
    */

    var params = req.body;
    if(params.serial == undefined || params.videoId == undefined || params.type == undefined ||
        params.serial == '' || params.videoId == '' || params.type == ''){
        res.json(settings.ERROR);
        res.end();
        return;
    }

    var current = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var p = {
        "collection": "tracking",
        "document": params.serial + "|"+ new Date().toISOString(),
        "field": {
            "serial": params.serial,
            "videoId": params.videoId,
            "type": params.type,
            "time": current,
            "ip": ip,
            "ts": new Date().getTime()
        }
    }

    firestore.insert(p, res);

});


router.get("/selects", (req, res)=>{
    if (req.headers['secret'] !== "dzokara") {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    var next = req.query.next;
    var time = req.query.time;
    var limit = req.query.limit;

    var p = {
        "collection": "tracking",
        "order":{
            "field": "ts",
            "limit": Number(limit),
            "next": Number(next)
        },
        "where":{
            "field":"ts",
            "condition": ">",
            "value": Number(time)
        }
    }


    console.log(JSON.stringify(p))

    firestore.paging(p, res);
});

router.get("/my-ip", (req, res)=>{
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    res.send(ip);
    res.end();
});

module.exports = router;