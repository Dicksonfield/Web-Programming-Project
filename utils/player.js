let players = [];

const playerJoin = (id, name, roomID) => {
    const x = Math.floor(Math.random() * 49) + 1;
    const y = Math.floor(Math.random() * 49) + 1;
    const user = { id, name, snake: [{x, y}], roomID}
    players.push(user);
    return user
}

const updatePosition = (id, positions) => {
    if(id) {
        const player = players.find(player => player.id == id);
        player.snake = positions;
    }
}

const playerLeave = (id) => {
    const player = players.find(player => player.id == id);
    if(player) {
        players = players.filter(player => player.id != id);
    }
    return player;
}

const getPlayers = (room) => {
    return players.filter(player => player.roomID == room);
}

const getPlayer = (id) => {
    return players.find(player => player.id == id);
}

module.exports = {
    playerJoin,
    getPlayers,
    playerLeave,
    getPlayer,
    updatePosition
};