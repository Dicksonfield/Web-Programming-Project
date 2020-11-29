<<<<<<< HEAD
function makeTableHTML(myArray) {

    let result = "<table border=1>";

    let highscore = [{name: "jason", score :0}, {name: "sam", score :0}, {name: "george", score :2}, {name: "katie", score :1000000000}]
    

    for(let i=0; i<highscore.length; i++) {

        result += "<tr>";


       

    }

    result += "</table>";
    return result;
}
=======
//Client

const socket = io();

socket.emit("requestLeaderboard");
socket.on("sendLeaderboard", ({leaderboard}) => {
    if(leaderboard.length > 100) leaderboard.slice(0,100);
});

console.log(leaderboard);
>>>>>>> e51f7a2cc26ba46a077b3973d555d67aafec02ca
