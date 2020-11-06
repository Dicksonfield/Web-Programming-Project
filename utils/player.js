let players = [];

const playerJoin = (id, name) => {
    const left = Math.floor(Math.random() * 100)*5 + "px";
    const top = Math.floor(Math.random() * 100)*5 + "px";
    const user = { id, name, left, top }
    console.log(user)
    players.push(user);

    return user
}

const playerLeave = (id) => {
    const player = players.find(player => player.id == id);
    console.log(player)
    players = players.filter(player => player.id != id);
    console.log(players)

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