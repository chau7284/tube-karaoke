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

    firestore.paging(p, res);
});

router.post("/my-ip", (req, res)=>{

    var params = req.body;

    var current = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    res.send(ip);
    res.end();

    var p = {
        "collection": "RUNNING",
        "document": params.deviceName + "|"+ new Date().toISOString(),
        "field": {
            "deviceName": params.deviceName,
            "mode": params.mode,
            "battery": params.battery,
            "time": current,
            "ip": ip,
            "ok": params.ok,
            "fail":params.fail,
            "ban":params.ban
        }
    }

    firestore.insert(p, res);


    var para = {
        "collection": "IP",
        "document": ip,
        "field": {
            "time": current,
            "ip": ip,
        }
    }
    firestore.insert_silent(para);
});

router.get("/action", (req, res)=>{
    var p = {
        "collection": "ACTION"
    }
    firestore.gets(p, res)
});

router.get("/ban-ip", (req, res)=>{

    var ip = req.query.ip;

    var p = {
        "collection": "IP",
        "document": ip
    }
    firestore.get(p, res)
});

module.exports = router;