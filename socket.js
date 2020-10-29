const express = require('express');
const router = express.Router();
const server = require('http').createServer(router);
const io = require('socket.io').listen(server);
server.listen(process.env.PORT || 3000);
console.log("Server running...port: 3000");


let connections = [];
io.sockets.on('connection', (socket) => {
    connections.push(socket);
    console.log('<Connected>: -> %s sockets connected', connections.length);

    socket.on('disconnect', () => {
        connections.splice(connections.indexOf(socket), 1);
        console.log('<Disconnect>: -> %s sockets connected', connections.length);
    });
});
console.log("Hello");

async function start(){

}

module.exports = router;