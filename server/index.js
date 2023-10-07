const express = require('express');
const http = require('http');
const { resolve, dirname } = require('path');
const { Server } = require('socket.io');
const { resolve, dirname } = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);


const { PORT } = require('./config');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(resolve('virtual-chat/build')));

io.on('connection', (socket) => {
    console.log("Client connected");

    socket.on('message', (body) => {
        socket.broadcast.emit('message', {
            body,
            from: socket.id.slice(6)
        })
    })
})

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})
