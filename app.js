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
const e = require('express');
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, './public')));

server.listen(process.env.PORT || 3000);
console.log("Server running...port: 3000");

var datas = [];

app.get("/", async (req, res) => {

    var key = req.query.key;

    if (datas.length === 0) {
        if (key !== undefined) {
            //Get Data
            getData(key, res);
        } else {
            console.log("Other Key");
            res.render('index', { data: [] });
            res.end();
        }
    } else {
        var count = 0;
        datas.forEach((item) => {
            if (item.key === key) {
                if (item.date === utils.getCurrentDate()) {
                    console.log("Return Data");
                    res.render('index', { data: item.data[0].history });
                    res.end();
                    return false;
                } else {
                    //Get Data
                    getData(key, res);
                    return false;
                }
            } else {
                count++;
            }
        });
        if (count === datas.length) {
            //Get Data
            getData(key, res);
            return false;
        }
    }
});

async function getData(key, res) {
    console.log("Get Data");
    const response = await axios.get('http://8.12.17.73/history/find-history?key=' + key, {
        headers: {
            secret: '@Aa'
        }
    });
    var resp = response.data;
    if (resp !== null && resp.length > 0) {
        var item = {
            'date': utils.getCurrentDate(),
            'key': key,
            'data': resp
        }
        datas.push(item);
        res.render('index', { data: item.data[0].history });
        res.end();
    } else {
        console.log("Data Null");
        res.render('index', { data: [] });
        res.end();
    }
}



