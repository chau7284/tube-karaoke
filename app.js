const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const schedule = require('node-schedule');
const seconds = '*/1 * * * * *';

schedule.scheduleJob(seconds, function (time) {
    //connections[0].emit("timestamp", 0);
});

server.listen(process.env.PORT || 3000);
console.log("Server running...port: 3000");


app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/extract', async (req, res) => {
    // if (req.headers['secret'] !== settings.SECRET) {
    //     res.json(settings.UN_AUTH);
    //     res.end();
    //     return;
    // }
    var videoId = req.query.videoId;
    await findExtractWorker(videoId).then(streamData =>{
        res.json(streamData);
        res.end();
    })
});

function findExtractWorker(videoId) {
    return new Promise((resolve) => {
        if (connections.length > 0) {
            var socket = connections[0];
            socket.emit("EXTRACT", videoId);
            socket.on(videoId, streamData => {
                resolve(streamData);
            });
        }else{
            resolve(null);
        } 
    }) 
}

app.get('/search', async (req, res) => {
    // if (req.headers['secret'] !== settings.SECRET) {
    //     res.json(settings.UN_AUTH);
    //     res.end();
    //     return;
    // }
    var keyword = req.query.keyword;
    var deviceId = req.query.deviceId; //Split 11 charactor
    await findSearchWorker(deviceId, keyword).then(songs =>{
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
        }else{
            resolve(null);
        } 
    }) 
}

let connections = [];
io.sockets.on('connection', (socket) => {
    connections.push(socket);
    console.log('<Connected>: -> %s sockets connected', socket.id);

    socket.on('disconnect', () => {
        connections.splice(connections.indexOf(socket), 1);
        console.log('<Disconnect>: -> %s sockets connected', connections.length);
    });
})