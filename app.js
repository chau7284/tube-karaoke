const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const schedule = require('node-schedule');
const seconds = '*/30 * * * * *';

schedule.scheduleJob(seconds, function (time) {

});

let connections = [];
io.sockets.on('connection', (socket) => {
    connections.push(socket);
    console.log('<Connected>: -> %s sockets connected', connections.length);

    socket.on('disconnect', () => {
        connections.splice(connections.indexOf(socket), 1);
        console.log('<Disconnect>: -> %s sockets connected', connections.length);
    });
});

server.listen(process.env.PORT || 3000);
console.log("Server running...port: 3000");


app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

var extract = require('./routes/extract');
app.use('/extract', extract);