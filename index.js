const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { playerJoin, getPlayers, playerLeave, getPlayer, updatePosition } = require('./utils/player');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const gameRooms = ["room1","room2","room3","room4"];
var players = [];
var room = []

app.use(express.static(path.join(__dirname, 'public')));

io.of("/namespace").on("connection" , (socket) => {
    console.log("New Client");
    io.emit("welcome" , "Hello and Welcome");

    socket.on("joinRoom" , (room) => {
        if(gameRooms.includes(room)) {
            io.emit('playerJoin', socket.id, name , room);
            return socket.emit("success" , "You have joined room" + room);
        } else {
            return socket.emit("err" , "No Room named " + room);
        }
})
})

// socket.on('create or join', function (room) {
    
    //var numClients = io.sockets.clients(room).length;
io.on('connection', socket =>{
    socket.on('joinGame', ({ name , room }) => { 
    if (socket.id === 0){
        io.emit('playerJoin', socket.id, name , room);
        io.emit('created', room, socket.id);

    } else if (socket.id === 1) {
        io.emit('playerJoin',socket.id, name , room);
        io.emit('joined', room, socket.id);
        io.sockets.in(room).emit('ready');

    } else { // max two clients
        socket.on('disconnect', () => {
            playerLeave(socket.id); 
            })
        
    }
});
});
 
const state = {};
const clientRooms = {};

io.on('connection', socket => {
    socket.on('joinGame', ({ name , room }) => {
        
        playerJoin(socket.id, name , room);
        
        io.emit('updatePlayers', {
          players: getPlayers()
        })
        io.emit('getPlayer', { playerData: getPlayer(socket.id) })
    
    })
    
    socket.on('movePlayer', ({ direction }) => {
        io.emit('movePlayer', ({ direction: direction, id: socket.id }))
    })

    socket.on('updatePosition', (obj) => {
        updatePosition(obj.id, obj.positions)
        io.emit('updatePlayers', {
            players: getPlayers()
        })
        io.emit('getPlayer', { playerData: getPlayer(socket.id) })
   
    })

    socket.on('disconnect', () => {
        playerLeave(socket.id);
        io.emit('updatePlayers', {
            players: getPlayers()
        
        })
    
    });
});

server.listen(3000);