//Client

const socket = io();

socket.emit("requestLeaderboard");
socket.on("sendLeaderboard", ({leaderboard}) => {
    if(leaderboard.length > 100) leaderboard.slice(0,100);
});

console.log(leaderboard);