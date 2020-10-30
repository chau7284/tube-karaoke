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

var extract = require('./routes/extract');
app.use('/youtube', extract);


app.get('/extract', async (req, res) => {
    // if (req.headers['secret'] !== settings.SECRET) {
    //     res.json(settings.UN_AUTH);
    //     res.end();
    //     return;
    // }
    var videoId = req.query.videoId;
    findWorker(res, videoId);
});

function findWorker(res, videoId) {
    if (workers.length > 0) {
        var socket = workers[0];
        workers.shift();
        console.log('Remove Worker: ' + workers.length);
        socket.emit("EXTRACT", videoId);
        socket.on("EXTRACT", streamData => {
            //workers.push(socket);
            //res.json(streamData);
            //res.end();
            console.log('Add Worker: ' + streamData);
            console.log('Add Worker: ' + workers.length);
        });
    } else {
        res.json(null);
        res.end();
        console.log('Busy Worker: ' + 0);
    }
}

let connections = [];
let workers = [];
io.sockets.on('connection', (socket) => {
    connections.push(socket);
    workers.push(socket);
    console.log('<Connected>: -> %s sockets connected', connections.length);

    socket.on('disconnect', () => {
        connections.splice(connections.indexOf(socket), 1);
        console.log('<Disconnect>: -> %s sockets connected', connections.length);
    });


    socket.emit("EXTRACT", "Coneect");
    socket.on("EXTRACT", (a) => {
        //workers.push(socket);
        //res.json(streamData);
        //res.end();
        console.log('Add Worker: ' + a);
        //console.log('Add Worker: ' + workers.length);
    })
})