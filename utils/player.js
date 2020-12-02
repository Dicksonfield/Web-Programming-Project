let players = [];

//constructor for player, holds a unique id, username, room ID and starting position randomly generated
const playerJoin = (id, name, roomID) => {
    const x = Math.floor(Math.random() * 29) + 1;
    const y = Math.floor(Math.random() * 29) + 1;
    const user = { id, name, snake: [{x, y}], roomID}
    players.push(user);
    return user
}

//updates position of all items in snake object
const updatePosition = (id, positions) => {
    if(id) {
        const player = players.find(player => player.id == id);
        player.snake = positions;
    }
}

//removes the player on leaving and returns them as an object
const playerLeave = (id) => {
    const player = players.find(player => player.id == id);
    if(player) {
        players = players.filter(player => player.id != id);
    }
    return player;
}

//gets players based on a given room
const getPlayers = (room) => {
    return players.filter(player => player.roomID == room);
}

//gets player based on a given id
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