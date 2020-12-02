const socket = io();
socket.emit("requestLeaderboard");
socket.on("sendLeaderboard", ({leaderboard}) => {
    if(leaderboard.length > 100) leaderboard = leaderboard.slice(0,100);
    makeTable(leaderboard);
});

function makeTable(name){

    let result = "";
    result = "<table><th>Place</th> <th>Name</th> <th style='cursor:pointer' onclick='highScoreSort();'>Highscore ▼ </th> <th style='cursor:pointer' onclick='totalEatenSort();'>Total Eaten ▼ </th> <th style='cursor:pointer' onclick='winsSort();'>Wins ▼ </th>";

    for(let i=0; i<name.length; i++) {

        result += `<tr> <td>${i+1}</td><td>${name[i].user}</td> <td>${name[i].highScore}</td> <td>${name[i].totalEaten}</td> <td>${name[i].wins}</td></tr>`;
    }

    result += "</table>";       
    leaderboard.innerHTML=result;
}

 // sorts table by totalEaten
function totalEatenSort(){

    socket.emit("requestLeaderboardTotalEaten");
    socket.on("sendLeaderboard", ({leaderboard}) => {
    
        if(leaderboard.length > 100) leaderboard = leaderboard.slice(0,100);
    makeTable(leaderboard);
    });

    makeTable(name);
}

 // sorts table by wins
function winsSort(){

    socket.emit("requestLeaderboardTotalEaten");
    socket.on("sendLeaderboard", ({leaderboard}) => {
    
        if(leaderboard.length > 100) leaderboard = leaderboard.slice(0,100);
    makeTable(leaderboard);
    });

    makeTable(name);
}
 // sorts table by highScore
function highScoreSort(){

    socket.emit("requestLeaderboard");
    socket.on("sendLeaderboard", ({leaderboard}) => {
    
        if(leaderboard.length > 100) leaderboard = leaderboard.slice(0,100);
    makeTable(leaderboard);
    });

    makeTable(name);
}
