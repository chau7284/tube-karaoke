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
const utils = require('./utils');
let connections = [];
const TIMEOUT = 10000;

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

app.get("/get-farmer", (req, res) => {
    res.send(String(connections.length));
});

var link = require('./routes/link');
app.use('/link', link);

var account = require('./routes/account');
app.use('/account', account);

var user = require('./routes/user');
app.use('/user', user);

var tracking = require('./routes/tracking');
app.use('/tracking', tracking);

var code = require('./routes/key');
app.use('/key', code);

var video = require('./routes/video');
app.use('/video', video);


//////////////////////////////////////////////////
var db = require('./mongo');
var dbAccount = require('./dbAccount');
const key = async (req, res, next) => {
    try {
        var apiKey = req.query.key;

        await dbAccount.findOne(
            { key: apiKey }
        ).exec((error, user) => {
            if (!error) {
                if (user == null) {
                    res.json(settings.KEY_INVALID);
                    res.end();
                } else {
                    if (user.counter > 0) {
                        user.counter--;
                        user.updated = new Date();
                        user.save()
                        next();
                    } else {
                        res.json(settings.KEY_LIMITED);
                        res.end();
                    }
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

//Public
app.get('/get', key, async (req, res) => {
    try {
        var videoId = req.query.videoId;
        console.log("<<<<<- GET-VIDEO: >>>>> " + videoId);
        await db.find_song_by_id(videoId, song => {
            if (song != null) {
                if (song.video.length > 0 && !utils.checkExpire(song.video)) {
                    console.log("<<<<<- RETURN-CACHE: >>>>> " + videoId);
                    res.json(song);
                    res.end();
                    console.log("");
                } else {
                    console.log("<<<<<- LINK-EXPIRE: >>>>> " + videoId);
                    findExtractFarmer(videoId).then(streamData => {
                        if (streamData)
                            console.log("<<<<<- RETURN-EXTRACT: >>>>> " + videoId);
                        else
                            console.log("<<<<<- RETURN-NULL: >>>>> " + videoId);
                        res.json(streamData);
                        res.end();
                        console.log("");
                    });
                }
            } else {
                findExtractFarmer(videoId).then(streamData => {
                    if (streamData)
                        console.log("<<<<<- RETURN-EXTRACT: >>>>> " + videoId);
                    else
                        console.log("<<<<<- RETURN-NULL: >>>>> " + videoId);
                    res.json(streamData);
                    res.end();
                    console.log("");
                });
            }
        });
    } catch (err) {
        res.json(settings.ERROR);
        res.end();
    }
});

//Dzo Kara Dropbox
app.get('/get-link', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    try {
        var videoId = req.query.videoId;
        console.log("<<<<<- GET-VIDEO: >>>>> " + videoId);
        await db.find_video_by_id(videoId, songStream => {
            if (songStream != null) {
                console.log("<<<<<- RETURN-CACHE: >>>>> " + videoId);
                res.json(songStream);
                res.end();
                console.log("");
            } else {
                findExtractFarmer(videoId).then(streamData => {
                    if (streamData)
                        console.log("<<<<<- RETURN-EXTRACT: >>>>> " + videoId);
                    else
                        console.log("<<<<<- RETURN-NULL: >>>>> " + videoId);
                    res.json(streamData);
                    res.end();
                    console.log("");
                });
            }
        });
    } catch (err) {
        res.json(settings.ERROR);
        res.end();
    }
});

function findExtractFarmer(videoId) {
    console.log("<<<<<- FARMER-EXTRACT: >>>>> " + videoId);
    return new Promise((resolve) => {
        if (connections.length <= 0) {
            resolve(null);
        } else {
            //Framer
            var socket = null;
            for (var sock of connections) {
                if (sock.free) {
                    socket = sock;
                    console.log(socket.id);
                    break;
                }
            }

            if (socket != null) {
                var timeout = setTimeout(() => {
                    socket.free = true;
                    resolve(null);
                }, TIMEOUT);
                socket.free = false;
                socket.emit("EXTRACT", videoId);
                socket.on(videoId, streamData => {
                    clearTimeout(timeout);
                    socket.free = true;
                    resolve(streamData);
                });
            } else {
                resolve(null);
            }
        }
    })
}


/////////////////////Socket////////////////////
io.sockets.on('connection', (socket) => {
    socket.free = true;
    connections.push(socket);
    console.log('<Connected>: -> %s sockets connected', connections.length);

    socket.on('disconnect', () => {
        connections.splice(connections.indexOf(socket), 1);
        console.log('<Disconnect>: -> %s sockets connected', connections.length);
    });
})

//Schedule
//schedule.scheduleJob(seconds, function (time) {
    //connections[0].emit("timestamp", 0);
//});