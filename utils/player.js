let players = [];

const playerJoin = (id, name) => {
    // const x = Math.floor(Math.random() * 50);
    // const y = Math.floor(Math.random() * 50);
    const user = { id, name, snake: [{x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2 }, {x: 3, y: 1}, {x: 4, y:1}, {x: 5, y: 1}, {x: 5, y:2}]}
    players.push(user);
    return user
}

const playerLeave = (id) => {
    const player = players.find(player => player.id == id);
    if(player) {
        players = players.filter(player => player.id != id);
    }

    return player;
}

const getPlayers = () => {
    return players;
}

const getPlayer = (id) => {
    console.log(players.find(player => player.id == id))
    return players.find(player => player.id == id);
}

module.exports = {
    playerJoin,
    getPlayers,
    playerLeave,
    getPlayer
};