const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//const schedule = require('node-schedule');
//const seconds = '*/1 * * * * *';
const settings = require('./settings');


server.listen(process.env.PORT || 3000);
console.log("Server running...port: 3000");


///////////////////Mongo///////////////////////////
const mongoose = require('mongoose');
//Config Mongo DB
const DATABASE_URL = "'mongodb://localhost/tubekaraoke";
const DATABASE_CONNECT_OPTION = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
//Connnect Mongo DB
mongoose.connect(DATABASE_URL, DATABASE_CONNECT_OPTION);
mongoose.connection.on("connected", () => {
    console.log("Connected to database successfully");
});
//Error Mongo DB
mongoose.connection.on("disconnected", () => {
    console.log("Can not connected to database");
});
////////////////////END-MONGO///////////////////////

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

var link = require('./routes/link');
app.use('/link', link);


//////////////////////////////////////////////////
var db = require('./mongo');
//Public
app.get('/get', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET_PUBLIC) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    try {
        var videoId = req.query.videoId;
        console.log("<<<<<- GET-VIDEO: >>>>> " + videoId);
        await db.find_song_by_id(videoId, song => {
            if (song != null) {
                console.log("<<<<<- RETURN-CACHE: >>>>> " + videoId);
                res.json(song);
                res.end();
            } else {
                findExtractWorker(videoId).then(streamData => {
                    console.log("<<<<<- RETURN-EXTRACT: >>>>> " + videoId);
                    res.json(streamData);
                    res.end();
                    //Video Not in Data -> Write to DB
                })
            }
        });
    } catch (err) {
        res.json(settings.ERROR);
        res.end();
    }
});

function findExtractWorker(videoId) {
    console.log("<<<<<- SOCKET-EXTRACT: >>>>> " + videoId);
    return new Promise((resolve) => {
        if (connections.length > 0) {
            var socket = connections[0];
            socket.emit("EXTRACT", videoId);
            socket.on(videoId, streamData => {
                resolve(streamData);
            });
        } else {
            resolve(null);
        }
    })
}

app.get('/extract', async (req, res) => {
    // if (req.headers['secret'] !== settings.SECRET) {
    //     res.json(settings.UN_AUTH);
    //     res.end();
    //     return;
    // }
    var videoId = req.query.videoId;
    await findExtractWorker(videoId).then(streamData => {
        res.json(streamData);
        res.end();
    })
});

app.get('/info', async (req, res) => {
    // if (req.headers['secret'] !== settings.SECRET) {
    //     res.json(settings.UN_AUTH);
    //     res.end();
    //     return;
    // }
    var videoId = req.query.videoId;
    await findExtractWorker(videoId).then(streamData => {
        res.json(streamData);
        res.end();
    })
});

app.get('/search', async (req, res) => {
    // if (req.headers['secret'] !== settings.SECRET) {
    //     res.json(settings.UN_AUTH);
    //     res.end();
    //     return;
    // }
    var keyword = req.query.keyword;
    var deviceId = req.query.deviceId; //Split 11 charactor
    await findSearchWorker(deviceId, keyword).then(songs => {
        res.json(songs);
        res.end();
    })
});

function findSearchWorker(deviceId, keyword) {
    return new Promise((resolve) => {
        if (connections.length > 0) {
            var socket = connections[0];
            socket.emit("SEARCH", keyword, deviceId);
            socket.on(deviceId, songs => {
                resolve(songs);
            });
        } else {
            resolve(null);
        }
    })
}

/////////////////////Socket////////////////////
let connections = [];
io.sockets.on('connection', (socket) => {
    connections.push(socket);
    console.log('<Connected>: -> %s sockets connected', socket.id);

    socket.on('disconnect', () => {
        connections.splice(connections.indexOf(socket), 1);
        console.log('<Disconnect>: -> %s sockets connected', connections.length);
    });
})

//Schedule
//schedule.scheduleJob(seconds, function (time) {
    //connections[0].emit("timestamp", 0);
//});