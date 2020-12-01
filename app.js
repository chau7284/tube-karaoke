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

var account = require('./routes/account');
app.use('/account', account);


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
                        user.updated = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
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

// var link = "https://r1---sn-i3belnl6.googlevideo.com/videoplayback?expire=1606841167&ei=7h7GX5-HOobC3LUP16qGqAc&ip=103.254.12.68&id=o-AE-CZcVqLsFQjlYMIKR5PEP1gH3xzwJ9q9qYVSx2OSDc&itag=248&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278&source=youtube&requiressl=yes&vprv=1&mime=video%2Fwebm&ns=IF7roekFxfEWnp-2OcKvls8F&gir=yes&clen=403746279&dur=4253.783&lmt=1585367137101943&fvip=6&keepalive=yes&beids=9466588&c=WEB&txp=5431432&n=fzFFGckRLP-24ugUFMW&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&sig=AOq0QJ8wRAIgSs9c6LQ0Hzm4oIAA1_b1yMVTojNUlFGe94s-APsCfysCIF-TX85d1LIW5X4XAFmaXvT7VJ8YrujtS-vfF2uPU_7V&title=Nh%E1%BA%A1c%20V%C3%A0ng%20L%C3%ADnh%20X%C6%B0a%20DUY%20KH%C3%81NH%20-%20Nh%E1%BB%AFng%20Ca%20Kh%C3%BAc%20L%C3%ADnh%20X%C6%B0a%20Theo%20Th%E1%BB%9Di%20Gian%20Hay%20V%E1%BA%ABn%20Hay%20C%E1%BB%A7a%20DUY%20KH%C3%81NH%%%vctsoft.com&rm=sn-42u-jmgl7d,sn-42u-i5oll7d&fexp=9466588&req_id=64055496faa5a3ee&redirect_counter=2&cms_redirect=yes&ipbypass=yes&mh=5f&mm=30&mn=sn-i3belnl6&ms=nxu&mt=1606819431&mv=u&mvi=1&pl=22&lsparams=ipbypass,mh,mm,mn,ms,mv,mvi,pl&lsig=AG3C_xAwRgIhANyGDQQlpcC7OciUgEAx0IGD6RbN1gGPSjNFliD-3QI-AiEAq7rYtkI3AwzkDFYclA6AScllXKX039bIpounH4glO7o%3D";
// var regex = "expire=";
// var match = link.match(regex);
// if (match && match[2].length == 11) {
//     console.log(match[2]);
// } else {
//     console.log("null");
// }


//Public
app.get('/test', async (req, res) => {
    try {
        var videoId = req.query.videoId;
        console.log("<<<<<- GET-VIDEO: >>>>> " + videoId);
        findExtractFarmer(videoId).then(streamData => {
            console.log("<<<<<- RETURN-EXTRACT: >>>>> " + videoId);
            res.json(streamData);
            res.end();
        })
    } catch (err) {
        res.json(settings.ERROR);
        res.end();
    }
});

const TIMEOUT = 1000000000;
function findExtractFarmer(videoId) {
    console.log("<<<<<- SOCKET-EXTRACT: >>>>> " + videoId);
    return new Promise((resolve) => {
        if (connections.length <= 0) {
            resolve(null);
        } else {
            //Framer
            var socket = null;
            for (var sock of connections){
                if(sock.free){
                    socket = sock;
                    console.log(socket.id);
                    break;   
                }
            }

            if(socket != null){
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
                    checkQueueList();
                });
            }else{
                resolve(null);
            }
        }
    })
}



//Public
app.get('/get', key, async (req, res) => {
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