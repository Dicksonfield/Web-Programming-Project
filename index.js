const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { playerJoin, getPlayers, playerLeave, getPlayer, updatePosition } = require('./utils/player');

const uuid = require("uuid");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const mongoose = require("mongoose");
const url = "mongodb+srv://test:dicksonfield@cluster0.ujlvn.mongodb.net/userData?retryWrites=true&w=majority";
mongoose.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => server.listen(3000))
    .catch((err) => console.log(err));
const User = require("./models/stats");
const { Console } = require('console');

var rooms = [];
let roomID = 0;
var id=1;
var colorhexadecimal;
const colors = ['orange','green','red','purple','yellow','magenta',];

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
    
    socket.on('joinGame', ({ name, cookie }) => {
        socket.join(roomID);
        playerJoin(socket.id, name, roomID);
        room = rooms.find(item => item.id == roomID);
        if (room == null) {
            const room = {id: roomID,started: false,players:1}
            rooms.push(room)
        } 
        else {
            room.players++;
            if(room.players == 2){
                room.started = true;
                roomID++;
            }
        }
        console.log(rooms);

        databaseHandle(name,cookie);

        io.emit('updatePlayers', {
            players: getPlayers()
        })
        io.emit('getPlayer', { playerData: getPlayer(socket.id) })
    })
    
    io.on('connection', function(socket) {
        console.log("user "+id+" connected");
        console.log(colors[id]);
        socket.emit('colorEvent', colors);
        if(id >=1 && id<= 4 ){
             colors[id];
          } else {
             colors[0];
          }
          id++;
    })

    socket.emit('colorEvent', colorhexadecimal);


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
        console.log('A user disconnected');
        const player = playerLeave(socket.id);
        io.emit('updatePlayers', {
            players: getPlayers()
        })
        socket.leave(player.roomID);
        room = rooms.find(item => item.id == player.roomID);
        room.players--;
        if(room.players == 0){
            rooms = rooms.filter(item => item.id != player.roomID);
        }
        console.log(rooms);
        console.log(getPlayers());
    });

    const databaseHandle = (name,cookie) => {
        User.findOne({
            browser: cookie,
        })
            .then((result) => {
                if(result == null){
                    const playerID = uuid.v4();
                    newUser(name, playerID);
                    setTimeout(() => { databaseHandle(name,playerID); }, 1000);
                }
                else{
                    socket.emit("sendStats", { dbHighScore: result.highScore, dbTotalEaten: result.totalEaten, dbWins: result.wins}); }
            })
            .catch((err) => {
                console.log(err);
            });
        
        }

    const newUser = (name, playerID) => {
        console.log("new");
        socket.emit('setCookie', { cookie: playerID });
        const addUser = new User({
            browser: playerID,
            user: name,
            });
        addUser.save()
        .catch((err) => {
            console.log(err);
            });
    }

    socket.on('updateStats', ({updateName, cookie, dbHS, dbTE, dbW}) => {
        User.findOne({
            browser: cookie,
        })
            .then((result) => {
                result.user = updateName;
                result.highScore = dbHS;
                result.totalEaten = dbTE;
                result.wins = dbW;
                result.save();
            })
            .catch((err) => {
                console.log(err);
            });
    });
    
    socket.on('requestLeaderboard', () => {
        User.find().sort({ highScore: -1 })
        .then((result) => {
            socket.emit("sendLeaderboard", {leaderboard: result});
        })
        .catch((err) => {
            console.log(err);
        });                                                            
    })

});