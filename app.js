const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//const schedule = require('node-schedule');
//const seconds = '*/1 * * * * *';
const settings = require('./settings');
const utils = require('./utils');
const firestore = require('./firestore');
const axios = require('axios');

const path = require('path');
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, './public')));

server.listen(process.env.PORT || 3000);
console.log("Server running...port: 3000");


app.get("/", async (req, res) => {

    var key = req.query.key;
    var month = req.query.month;

    console.log(key + month);

    const response = await axios.get('http://apk-box.lizks.com/NASOTA/nasversion.json');
    var resp = response.data;
    if (resp !== null) {
        var arr = resp.Youtube;
        if (arr !== null && arr.length > 0) {
            var ver = arr[0].list;
            console.log(ver);

            var params = [
                {
                    "_id":"2021-03-01",
                    "day":1,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-02",
                    "day":2,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-03",
                    "day":3,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-04",
                    "day":4,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-05",
                    "day":5,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-06",
                    "day":6,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-07",
                    "day":7,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-08",
                    "day":8,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-09",
                    "day":9,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-10",
                    "day":10,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-11",
                    "day":11,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-12",
                    "day":12,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-13",
                    "day":13,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-14",
                    "day":14,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-15",
                    "day":15,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-16",
                    "day":16,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-17",
                    "day":17,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-18",
                    "day":18,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-19",
                    "day":19,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-20",
                    "day":20,
                    "month":3,
                    "year":2021,
                    "success":10,
                    "error":2
                },
                {
                    "_id":"2021-03-21",
                    "day":21,
                    "month":3,
                    "year":2021,
                    "success":30,
                    "error":5
                },
                {
                    "_id":"2021-03-22",
                    "day":22,
                    "month":3,
                    "year":2021,
                    "success":60,
                    "error":4
                },
                {
                    "_id":"2021-03-23",
                    "day":23,
                    "month":3,
                    "year":2021,
                    "success":60,
                    "error":4
                },
                {
                    "_id":"2021-03-24",
                    "day":24,
                    "month":3,
                    "year":2021,
                    "success":60,
                    "error":4
                },
                {
                    "_id":"2021-03-25",
                    "day":25,
                    "month":3,
                    "year":2021,
                    "success":60,
                    "error":4
                },
                {
                    "_id":"2021-03-26",
                    "day":26,
                    "month":3,
                    "year":2021,
                    "success":60,
                    "error":4
                },
                {
                    "_id":"2021-03-27",
                    "day":27,
                    "month":3,
                    "year":2021,
                    "success":60,
                    "error":4
                },
                {
                    "_id":"2021-03-28",
                    "day":28,
                    "month":3,
                    "year":2021,
                    "success":60,
                    "error":4
                },
                {
                    "_id":"2021-03-29",
                    "day":29,
                    "month":3,
                    "year":2021,
                    "success":60,
                    "error":4
                },
                {
                    "_id":"2021-03-30",
                    "day":30,
                    "month":3,
                    "year":2021,
                    "success":60,
                    "error":4
                },
                {
                    "_id":"2021-03-31",
                    "day":31,
                    "month":3,
                    "year":2021,
                    "success":60,
                    "error":4
                }
            ]

            console.log(params.length);

            res.render('index', { data: params});

        }
    }
});



