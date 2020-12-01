const socket = io();

socket.emit("requestLeaderboard");
socket.on("sendLeaderboard", ({leaderboard}) => {
    if(leaderboard.length > 100) leaderboard.slice(0,100);
    makeTableHTML(leaderboard);
});

function makeTableHTML(myArray) {

    let result = "<table border=1>";

    console.log(myArray);

    let highscore = [{name: "jason", score :0}, {name: "sam", score :0}, {name: "george", score :2}, {name: "katie", score :1000000000}]
    

    for(let i=0; i<highscore.length; i++) {

        result += "<tr>";


       

    }

    result += "</table>";
    return result;
}
