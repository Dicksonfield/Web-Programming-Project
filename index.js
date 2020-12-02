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
    .then(() => server.listen(process.env.PORT || 3000))
    .catch((err) => console.log(err));
const User = require("./models/stats");
const { Console } = require('console');

var rooms = [];
let roomID = 0;
let x = selectPos();
let y = selectPos();
let foodEaten = false;

function selectPos (){
    return Math.floor(Math.random() * (50 - 1) + 1);
}
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
    
    socket.on('joinGame', ({ name, cookie }) => {
        socket.join(roomID);
        room = rooms.find(item => item.id == roomID);
        playerJoin(socket.id, name, roomID);
        if (room == null) {
            room = {id: roomID,started: false,players:1}
            rooms.push(room)
        } 
        else {
            room.players++;
            if(room.players == 2){
                room.started = true;
                roomID++;
            }
        }

        databaseHandle(name,cookie);
        io.to(room.id).emit('updatePlayers', {
            players: getPlayers(room.id),
            x,
            y,
            room,
            roomID,
            currentPlayer: getPlayer(socket.id)
        })
        io.to(room.id).emit('getPlayer', { playerData: getPlayer(socket.id) })
    })
    
    socket.on('movePlayer', ({ direction, room }) => {
        console.log(rooms)
        console.log(getPlayers(room))
        
        io.to(room).emit('movePlayer', ({ direction: direction, id: socket.id }))
    })

    socket.on('generateFood', (room) => {
        console.log(room)
        if(foodEaten == false) {
            x = selectPos();
            y = selectPos();
        }
        foodEaten = true;
        console.log(x, y)
        io.to(room).emit('generateFood', ({x, y}))
        setInterval(() => { 
            foodEaten = false;
        }, 2000);
    })

    socket.on('disconnect', () => {
        const player = playerLeave(socket.id);
        if(player){
            room = rooms.find(item => item.id == player.roomID);
            io.to(player.roomID).emit('updatePlayers', {
                players: getPlayers(player.roomID),
                x,
                y,
                room,
                roomID: room.id
                
            })
            socket.leave(player.roomID);
            
            room.players--;
            if(room.players == 0){
                rooms = rooms.filter(item => item.id != player.roomID);
            }
        }
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

    socket.on('addWin', ({cookie, dbW}) => {
        User.findOne({
            browser: cookie,
        })
            .then((result) => {
                result.wins += 1;
                result.save();
            })
            .catch((err) => {
                console.log(err);
            });
    });
    
    // default (highScore) sort
    socket.on('requestLeaderboard', () => {
        User.find().sort({ highScore: -1 })
        .then((result) => {
            socket.emit("sendLeaderboard", {leaderboard: result});
        })
        .catch((err) => {
            console.log(err);
        });                                                            
    })

    // totalEaten sort
    socket.on('requestLeaderboardTotalEaten', () => {
        User.find().sort({ totalEaten: -1 })
        .then((result) => {
            socket.emit("sendLeaderboard", {leaderboard: result});
        })
        .catch((err) => {
            console.log(err);
        });                                                            
    })

    // wins sort
    socket.on('requestLeaderboardWins', () => {
        User.find().sort({ wins: -1 })
        .then((result) => {
            socket.emit("sendLeaderboard", {leaderboard: result});
        })
        .catch((err) => {
            console.log(err);
        });                                                            
    })
});