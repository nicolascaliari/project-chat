const express = require('express');
const http = require('http');
const {Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log("Client connected");

    socket.on('message', (body) => {
        socket.broadcast.emit('message', {
            body,
            from:socket.id.slice(6)
        })
    })
})

server.listen(3000, () => {
    console.log('Server is running on port 3000')
})
