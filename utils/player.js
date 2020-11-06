let players = [];

const playerJoin = (id, name) => {
    const left = Math.floor(Math.random() * 100) + 1 + '%';
    const top = Math.floor(Math.random() * 100) + 1 + '%';
    const user = { id, name, left, top }
    players.push(user);

    return user
}

const getPlayers = () => {
    return players;
}

module.exports = {
    playerJoin,
    getPlayers
};