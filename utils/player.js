let players = [];

const playerJoin = (id, name) => {
    const x = Math.floor(Math.random() * 70);
    const y = Math.floor(Math.random() * 70);
    const user = { id, name, snake: [{x, y}]}
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