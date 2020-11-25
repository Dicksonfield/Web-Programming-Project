const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { playerJoin, getPlayers, playerLeave, getPlayer, updatePosition } = require('./utils/player');

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

const userAdd = ( name, id ) => {
    const addUser = new User({
        browser: id,
        user: name,
    });
    addUser.save()
        .catch((err) => {
            console.log(err);
        });
}

app.get("/leaderboard", (req,res) => {
    User.find().sort({ highScore: -1 })
        .then((result) => {
            res.send(result[0])
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/get-user", (req,res) => {
    User.findOne({
        browser: 0,
    })
        .then((result) => {
            res.send(result);
            console.log(result)
        })
        .catch((err) => {
            console.log(err);
        });
});

app.use(express.static(path.join(__dirname, 'public')));

const mongoose = require("mongoose");
const url = "mongodb+srv://test:dicksonfield@cluster0.ujlvn.mongodb.net/userData?retryWrites=true&w=majority";
mongoose.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => server.listen(3000))
    .catch((err) => console.log(err));
const User = require("./models/stats");
const { Console } = require('console');

const userAdd = ( name, id ) => {
    const addUser = new User({
        browser: id,
        user: name,
    });
    addUser.save()
        .catch((err) => {
            console.log(err);
        });
}

app.get("/leaderboard", (req,res) => {
    User.find().sort({ highScore: -1 })
        .then((result) => {
            res.send(result[0])
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/get-user", (req,res) => {
    User.findOne({
        browser: 0,
    })
        .then((result) => {
            res.send(result);
            console.log(result)
        })
        .catch((err) => {
            console.log(err);
        });
});

io.on('connection', socket => {
    socket.on('joinGame', ({ name }) => {
        playerJoin(socket.id, name);
        userAdd(name, Date.now());

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