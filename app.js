const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server, {
    pingTimeout: 1000,
    pingInterval: 1000
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//const schedule = require('node-schedule');
//const seconds = '*/1 * * * * *';
const settings = require('./settings');
const utils = require('./utils');
const firestore = require('./firestore');
//const axios = require('./axios');
let connections = [];
let farmers = [];
const TIMEOUT = 10000;

server.listen(process.env.PORT || 3000);
console.log("Server running...port: 3000");


///////////////////Mongo///////////////////////////
const mongoose = require('mongoose');
//Config Mongo DB
//const DATABASE_URL = "mongodb+srv://root:chau123456@dzolink.2fbff.mongodb.net/dzolink?retryWrites=true&w=majority";
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
    res.send(String(farmers.length) + "/" + String(connections.length));
});

//Tube Karaoke
app.get("/app-config", async (req, res) => {
    if (req.headers['secret'] !== "kingpes") {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    res.json(
        {
            "versionName": "1.0.4",
            "secretKey": settings.SECRET,
            "privateKey": settings.KEY,
            "nextVersion": ""
        }
    );
});

var link = require('./routes/link');
app.use('/link', link);

//Key Query Link
var account = require('./routes/account');
app.use('/account', account);

var user = require('./routes/user');
app.use('/user', user);

var tracking = require('./routes/tracking');
app.use('/tracking', tracking);

//Key Active App
var code = require('./routes/key');
app.use('/key', code);

var video = require('./routes/video');
app.use('/video', video);

var history = require('./routes/history');
app.use('/history', history);

var soundcloud = require('./routes/soundcloud');
app.use('/soundcloud', soundcloud);

//////////////////////////////////////////////////
var db = require('./mongo');
var sc = require('./sc');
var dbAccount = require('./dbAccount');
var dbHistory = require('./dbHistory');

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

// Decrapted
//Public dzolink
// app.get('/get', key, async (req, res) => {
//     try {
//         var videoId = req.query.videoId;
//         if (videoId === "") {
//             res.end();
//         } else {
//             console.log("<<<<<- GET-VIDEO: >>>>> " + videoId);
//             await db.find_song_by_id(videoId, song => {
//                 if (song != null) {
//                     if (song.video.length > 0 && !utils.checkExpire(song.video[0].url)) {
//                         console.log("<<<<<- RETURN-CACHE: >>>>> " + videoId);
//                         res.json(song);
//                         res.end();
//                         //Log
//                         writeHistory(req.query.key, 1);
//                     } else if (song.mix.length > 0 && !utils.checkExpire(song.mix[0].url)) {
//                         console.log("<<<<<- RETURN-CACHE: >>>>> " + videoId);
//                         res.json(song);
//                         res.end();
//                         //Log
//                         writeHistory(req.query.key, 1);
//                     } else {
//                         console.log("<<<<<- LINK-EXPIRE: >>>>> " + videoId);
//                         findFarmer(videoId, req.query.key).then(streamData => {
//                             if (streamData)
//                                 console.log("<<<<<- RETURN-EXTRACT: >>>>> " + videoId);
//                             else
//                                 console.log("<<<<<- RETURN-NULL: >>>>> " + videoId);
//                             res.json(streamData);
//                             res.end();
//                         });
//                     }
//                 } else {
//                     findFarmer(videoId, req.query.key).then(streamData => {
//                         if (streamData)
//                             console.log("<<<<<- RETURN-EXTRACT: >>>>> " + videoId);
//                         else
//                             console.log("<<<<<- RETURN-NULL: >>>>> " + videoId);
//                         res.json(streamData);
//                         res.end();
//                     });
//                 }
//             });
//         }
//     } catch (err) {
//         res.json(settings.ERROR);
//         res.end();
//     }
// });

//Public dzolink
app.get('/parseYT', key, async (req, res) => {
    if (req.headers['secret'] !== "yt_p@rse") {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    try {
        var videoId = req.query.videoId;
        if (videoId === "") {
            res.end();
        } else {
            console.log("<<<<<- GET-VIDEO: >>>>> " + videoId);
            await db.find_song_by_id(videoId, song => {
                if (song != null) {
                    if (song.video.length > 0 && !utils.checkExpire(song.video[0].url)) {
                        console.log("<<<<<- RETURN-CACHE: >>>>> " + videoId);
                        res.json(song);
                        res.end();
                        //Log
                        writeHistory(req.query.key, 1);
                    } else if (song.mix.length > 0 && !utils.checkExpire(song.mix[0].url)) {
                        console.log("<<<<<- RETURN-CACHE: >>>>> " + videoId);
                        res.json(song);
                        res.end();
                        //Log
                        writeHistory(req.query.key, 1);
                    } else {
                        console.log("<<<<<- LINK-EXPIRE: >>>>> " + videoId);
                        findFarmer(videoId, req.query.key).then(streamData => {
                            if (streamData)
                                console.log("<<<<<- RETURN-EXTRACT: >>>>> " + videoId);
                            else
                                console.log("<<<<<- RETURN-NULL: >>>>> " + videoId);
                            res.json(streamData);
                            res.end();
                        });
                    }
                } else {
                    findFarmer(videoId, req.query.key).then(streamData => {
                        if (streamData)
                            console.log("<<<<<- RETURN-EXTRACT: >>>>> " + videoId);
                        else
                            console.log("<<<<<- RETURN-NULL: >>>>> " + videoId);
                        res.json(streamData);
                        res.end();
                    });
                }
            });
        }
    } catch (err) {
        res.json(settings.ERROR);
        res.end();
    }
});

// Decrapted
//Public soundcloud
// app.get('/getsc', key, async (req, res) => {
//     try {
//         var id = req.query.id;
//         var url = req.query.url;
//         var clientId = req.query.clientId;
//         if (clientId === "") {
//             res.end();
//         } else {
//             console.log("<<<<<- GET-SC: >>>>> " + id);
//             await sc.find_by_id(id, data => {
//                 if (data != null) {
//                     if (data.url !== undefined || data.url !== "") {
//                         console.log("<<<<<- Query-SC-S3: >>>>> " + id);
//                         res.json(data);
//                         res.end();
//                     } else {
//                         console.log("<<<<<- Query-SC-FRAMER-DB: >>>>> " + id);
//                         findFarmerSC(id, url, clientId, req.query.key).then(scData => {
//                             if (scData)
//                                 console.log("<<<<<- RETURN-EXTRACT-SC: >>>>> " + id);
//                             else
//                                 console.log("<<<<<- RETURN-NULL-SC: >>>>> " + id);
//                             res.json(scData);
//                             res.end();
//                         });
//                     }
//                 } else {
//                     console.log("<<<<<- Query-SC-FAMER-API: >>>>> " + id);
//                     findFarmerSC(id, url, clientId, req.query.key).then(scData => {
//                         if (scData)
//                             console.log("<<<<<- RETURN-EXTRACT-SC: >>>>> " + id);
//                         else
//                             console.log("<<<<<- RETURN-NULL-SC: >>>>> " + id);
//                         res.json(scData);
//                         res.end();
//                     });
//                 }
//             });
//         }
//     } catch (err) {
//         res.json(settings.ERROR);
//         res.end();
//     }
// });

//Public soundcloud
app.get('/parseSC', key, async (req, res) => {
    if (req.headers['secret'] !== "sc_p@rse") {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }
    try {
        var id = req.query.id;
        var url = req.query.url;
        var clientId = req.query.clientId;
        if (clientId === "") {
            res.end();
        } else {
            console.log("<<<<<- GET-SC: >>>>> " + id);
            await sc.find_by_id(id, data => {
                if (data != null) {
                    if (data.url !== undefined || data.url !== "") {
                        console.log("<<<<<- Query-SC-S3: >>>>> " + id);
                        res.json(data);
                        res.end();
                    } else {
                        console.log("<<<<<- Query-SC-FRAMER-DB: >>>>> " + id);
                        findFarmerSC(id, url, clientId, req.query.key).then(scData => {
                            if (scData)
                                console.log("<<<<<- RETURN-EXTRACT-SC: >>>>> " + id);
                            else
                                console.log("<<<<<- RETURN-NULL-SC: >>>>> " + id);
                            res.json(scData);
                            res.end();
                        });
                    }
                } else {
                    console.log("<<<<<- Query-SC-FAMER-API: >>>>> " + id);
                    findFarmerSC(id, url, clientId, req.query.key).then(scData => {
                        if (scData)
                            console.log("<<<<<- RETURN-EXTRACT-SC: >>>>> " + id);
                        else
                            console.log("<<<<<- RETURN-NULL-SC: >>>>> " + id);
                        res.json(scData);
                        res.end();
                    });
                }
            });
        }
    } catch (err) {
        res.json(settings.ERROR);
        res.end();
    }
});

//Test Heroku
app.get('/get-link-farmer', async (req, res) => {
    if (req.headers['secret'] !== settings.SECRET) {
        res.json(settings.UN_AUTH);
        res.end();
        return;
    }

    var videoId = req.query.videoId;
    findFarmer(videoId, "TEST").then(streamData => {
        if (streamData)
            console.log("<<<<<- RETURN-EXTRACT: >>>>> " + videoId);
        else
            console.log("<<<<<- RETURN-NULL: >>>>> " + videoId);
        res.json(streamData);
        res.end();
        console.log("");
    });
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

//Test
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
                    break;
                }
            }

            if (socket != null) {
                var timeout = setTimeout(() => {
                    socket.free = true;
                    resolve(null);
                }, TIMEOUT);
                socket.free = false;
                connections.splice(connections.indexOf(socket), 1); //remove socket
                socket.emit("EXTRACT", videoId);
                socket.on(videoId, streamData => {
                    clearTimeout(timeout);
                    socket.free = true;
                    connections.push(socket); //add socket
                    resolve(streamData);
                });
            } else {
                resolve(null);
            }
        }
    })
}

//OK YOUTUBE
function findFarmer(videoId, key) {
    console.log("<<<<<- FARMER-EXTRACT: >>>>> " + videoId);
    return new Promise((resolve) => {
        if (farmers.length <= 0) {
            farmers = connections.slice(); //copy
        }
        if (farmers.length <= 0) {
            resolve(null);
            //Log
            console.log(".....Farmer: -> 0");
            writeHistory(key, 0);
            firestore.updatenull("unknown", videoId, key, 1, "famer: 0");
        } else {
            //Framer
            //var socket = farmers[0];
            var socket = farmers[Math.floor(Math.random() * farmers.length)]; //get random
            if (socket != null) {
                var timeout = setTimeout(() => {
                    resolve(null);
                    //Log
                    console.log(".....Farmer: " + socket.deviceName + "-> timeout 10s");
                    writeHistory(key, 0);
                    firestore.updatenull(socket.deviceName, videoId, key, 2, "famer: timeout 10s");
                }, TIMEOUT);
                //farmers.shift();
                farmers.splice(farmers.indexOf(socket), 1); //remove socket
                socket.emit("EXTRACT", videoId);
                socket.on(videoId, streamData => {
                    socket.removeAllListeners(videoId);
                    clearTimeout(timeout);
                    resolve(streamData);
                    //Log
                    if (streamData === null) {
                        console.log(".....Farmer: " + socket.deviceName + "-> parse null");
                        writeHistory(key, 0);
                        firestore.updatenull(socket.deviceName, videoId, key, 3, "parse: null");
                    } else {
                        writeHistory(key, 1);
                    }
                });
            } else {
                resolve(null);
                //Log
                console.log(".....Farmer: -> null");
                writeHistory(key, 0);
                firestore.updatenull("unknown", videoId, key, 4, "socket: null");
            }
        }
    })
}

//OK SOUND CLOUD
function findFarmerSC(id, url, clientId, key) {
    const data = id + ";" + url + ";" + clientId;
    console.log("<<<<<- FARMER-EXTRACT-SC: >>>>> " + id);
    return new Promise((resolve) => {
        if (farmers.length <= 0) {
            farmers = connections.slice(); //copy
        }
        if (farmers.length <= 0) {
            resolve(null);
            //Log
            console.log(".....Farmer: -> 0");
            writeHistory(key, 0);
            firestore.updatenull("unknown", id, key, 1, "famer: 0");
        } else {
            //Framer
            //var socket = farmers[0];
            var socket = farmers[Math.floor(Math.random() * farmers.length)]; //get random
            if (socket != null) {
                var timeout = setTimeout(() => {
                    resolve(null);
                    //Log
                    console.log(".....Farmer: " + socket.deviceName + "-> timeout 10s");
                    writeHistory(key, 0);
                    firestore.updatenull(socket.deviceName, id, key, 2, "famer: timeout 10s");
                }, TIMEOUT);
                //farmers.shift();
                farmers.splice(farmers.indexOf(socket), 1); //remove socket
                socket.emit("EXTRACT", data);
                socket.on(id, scData => {
                    socket.removeAllListeners(id);
                    clearTimeout(timeout);
                    resolve(scData);
                    //Log
                    if (scData === null) {
                        console.log(".....Farmer: " + socket.deviceName + "-> parse null");
                        writeHistory(key, 0);
                        firestore.updatenull(socket.deviceName, id, key, 3, "parse: null");
                    } else {
                        writeHistory(key, 1);
                    }
                });
            } else {
                resolve(null);
                //Log
                console.log(".....Farmer: -> null");
                writeHistory(key, 0);
                firestore.updatenull("unknown", videoId, key, 4, "socket: null");
            }
        }
    })
}


/////////////////////Socket////////////////////
io.sockets.on('connection', (socket) => {
    socket.free = true;
    socket.deviceName = "unknown";
    connections.push(socket);
    console.log('<Connected>: -> %s sockets connected', connections.length);
    socket.emit('CONNECTED', "Connected...");

    socket.on('disconnect', () => {
        connections.splice(connections.indexOf(socket), 1);
        farmers = [];
        console.log('<Disconnect>: -> %s sockets connected', connections.length);
    });

    socket.on('CONNECTED', (deviceName) => {
        socket.deviceName = deviceName;
        //socket.emit('CONNECTED', "Connected...");
    });

    socket.on('START', () => {
        socket.emit('CONNECTED', "Connected...");
    });

    socket.on('PING', () => {
        var name = '';
        for (var sock of connections) {
            name += sock.deviceName + ","
        }
        name = name.substring(0, name.length - 1);
        socket.emit('PING', "OK -> Farmer: " + name + " -> Total: " + connections.length);
    });
})

//Schedule
//schedule.scheduleJob({ hour: 1, minute: 15 }, function (time) {
//    axios.getListVersion();
//});


// History
function writeHistory(key, status) {
    var date = utils.getCurrentDate();
    var arr = date.split("-");
    var day = 0;
    var month = 0;
    var year = 0
    if (arr.length > 2) {
        day = arr[2];
        month = arr[1];
        year = arr[0];
    }
    var success = 0;
    var error = 0;

    if (status === 1) {
        success = 1;
    } else {
        error = 1;
    }

    var params = {
        "_id": date,
        "year": year,
        "month": month,
        "day": day,
        "success": success,
        "error": error
    }


    dbHistory.findOne(
        {
            _id: key,
            "history._id": date
        },
        {
            "history.$": 1 //Get 1 element
        }
    )
        .exec((err, his) => {
            if (his !== null) {
                //Exist
                if (status === 1) {
                    params.success = his.history[0].success + 1;
                    params.error = his.history[0].error;
                } else {
                    params.success = his.history[0].success;
                    params.error = his.history[0].error + 1;
                }
                update(key, params);
            } else {
                //Not Exist
                checkKeyExist(key, params);
            }
        });
}

function checkKeyExist(key, params) {
    dbHistory.findOne(
        {
            _id: key,
        }
    )
        .exec((err, his) => {
            if (his !== null) {
                insert(key, params);
            } else {
                insertWithKey(key, params)
            }
        });
}

function insertWithKey(key, params) {
    try {
        dbHistory.create(
            {
                _id: key,
                history: params
            }
            ,
            (err, result) => {
                console.log("INSERT-HISTORY-WITH-KEY ->" + key);
            }
        );
    } catch (err) {
    }
}

function insert(key, params) {
    try {
        dbHistory.updateOne(
            {
                _id: key
            },
            {
                $push: {
                    history: params
                }
            }
        ).exec((err, result) => {
            console.log("INSERT-HISTORY ->" + key);
        });
    } catch (err) {

    }
}

function update(key, params) {
    try {
        dbHistory.updateOne(
            {
                _id: key,
                "history._id": params._id
            },
            {
                "$set":
                {
                    "history.$.success": params.success,
                    "history.$.error": params.error,
                }
            },
        )
            .exec((err, result) => {
                console.log("UPDATE-HISTORY ->" + key);
            });
    } catch (err) {

    }
}


