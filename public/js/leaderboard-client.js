const socket = io();

socket.emit("requestLeaderboard");
socket.on("sendLeaderboard", ({leaderboard}) => {
    if(leaderboard.length > 100) leaderboard.slice(0,100);
    makeTable(leaderboard);
});

function makeTable(name){

    let result = "";
    result = "<table><th>Place</th><th>Name</th><th>Highscore</th><th>Total Eaten</th><th>Wins</th>";

    for(let i=0; i<name.length; i++) {

        result += `<tr> <td>${i+1}</td><td>${name[i].user}</td> <td>${name[i].highScore}</td> <td>${name[i].totalEaten}</td> <td>${name[i].wins}</td></tr>`;
    }

    result += "</table>";       
    leaderboard.innerHTML=result;
}
