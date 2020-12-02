const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { playerJoin, getPlayers, playerLeave, getPlayer, updatePosition } = require('./utils/player');

//package to create unique DB id
const uuid = require("uuid");

//imports required server items
const app = express();
const server = http.createServer(app);
const io = socketio(server);

//creates connection to database
const mongoose = require("mongoose");
const url = "mongodb+srv://test:dicksonfield@cluster0.ujlvn.mongodb.net/userData?retryWrites=true&w=majority";
mongoose.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => server.listen(process.env.PORT || 3000))
    .catch((err) => console.log(err));
const User = require("./models/stats");
const { Console } = require('console');

//initialises variables
var rooms = [];
let roomID = 0;
let x = selectPos();
let y = selectPos();
let foodEaten = false;

//generates an x,y position
function selectPos (){
    return Math.floor(Math.random() * (30 - 1) + 1);
}
app.use(express.static(path.join(__dirname, 'public')));

//when the user connects
io.on('connection', socket => {
    
    //when the user joins the game
    socket.on('joinGame', ({ name, cookie }) => {
        //joins user to a room
        socket.join(roomID);
        room = rooms.find(item => item.id == roomID);
        playerJoin(socket.id, name, roomID);
        //if you are the first player in room, creates it
        if (room == null) {
            room = {id: roomID,started: false,players:1}
            rooms.push(room)
        } 
        //closes room on the 2nd player join, increments roomID to create next room
        else {
            room.players++;
            if(room.players == 2){
                room.started = true;
                roomID++;
            }
        }

        //gets user from database, or creates them inside it
        databaseHandle(name,cookie);

        //emits updates players to required room
        io.to(room.id).emit('updatePlayers', {
            players: getPlayers(room.id),
            x,
            y,
            room,
            // roomID,
            // currentPlayer: getPlayer(socket.id)
        })
        //gets player from room
        io.to(room.id).emit('getPlayer', { playerData: getPlayer(socket.id) })
    })
    
    //emits to all players in room, to move a given player
    socket.on('movePlayer', ({ direction, room }) => {
        console.log(rooms)
        console.log(getPlayers(room))
        
        io.to(room).emit('movePlayer', ({ direction: direction, id: socket.id }))
    })

    //generates food on server side to be created on all clients
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

    //no longer required
    // socket.on('updatePosition', (obj) => {
    //     updatePosition(obj.id, obj.positions)
    //     io.emit('updatePlayers', {
    //         players: getPlayers()
    //     })
    //     io.emit('getPlayer', { playerData: getPlayer(socket.id) })
    // })

    //handles user disconnection
    socket.on('disconnect', () => {
        const player = playerLeave(socket.id);
        if(player){
            //finds room based on player room ID
            room = rooms.find(item => item.id == player.roomID);
            io.to(player.roomID).emit('updatePlayers', {
                players: getPlayers(player.roomID),
                x,
                y,
                room,
                roomID: room.id
                
            })
            //takes player out of room
            socket.leave(player.roomID);
            
            //removes room from array it is now empty
            room.players--;
            if(room.players == 0){
                rooms = rooms.filter(item => item.id != player.roomID);
            }
        }
    });

    const databaseHandle = (name,cookie) => {
        //searches users locallly stored UUID in database
        User.findOne({
            browser: cookie,
        })
            .then((result) => {
                //if no UUID is stored or UUID is invalid, creates the user and recursively calls function to recheck
                if(result == null){
                    const playerID = uuid.v4();
                    newUser(name, playerID);
                    setTimeout(() => { databaseHandle(name,playerID); }, 1000);
                }
                
                //gets user stats and sends them to client
                else{
                    socket.emit("sendStats", { dbHighScore: result.highScore, dbTotalEaten: result.totalEaten, dbWins: result.wins}); }
            })
            //catches errors
            .catch((err) => {
                console.log(err);
            });
        
        }

    //creates a new user in database
    const newUser = (name, playerID) => {
        //sets user UUID in local storage
        socket.emit('setCookie', { cookie: playerID });
        //adds user to DB
        const addUser = new User({
            browser: playerID,
            user: name,
            });
        addUser.save()
        .catch((err) => {
            console.log(err);
            });
    }

    //updates users stats in database after a game is over or they leave
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

    //adds a win to user stats
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