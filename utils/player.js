let players = [];

const playerJoin = (id, name) => {
    const x = Math.floor(Math.random() * 21);
    const y = Math.floor(Math.random() * 21);
    const user = { id, name, x, y }
    console.log(user)
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

module.exports = {
    playerJoin,
    getPlayers,
    playerLeave
};