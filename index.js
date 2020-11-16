const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { playerJoin, getPlayers, playerLeave, getPlayer } = require('./utils/player');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
    socket.on('joinGame', ({ name }) => {
        playerJoin(socket.id, name);

        io.emit('updatePlayers', {
            players: getPlayers()
        })
    })

    io.emit('getPlayer', { player: getPlayer(socket.id) })
    
    socket.on('movePlayer', ({ direction }) => {
        io.emit('movePlayer', ({ direction: direction, id: socket.id }))
    })
    
    socket.on('disconnect', () => {
        playerLeave(socket.id);
        io.emit('updatePlayers', {
            players: getPlayers()
        })
    });
});



server.listen(3000);