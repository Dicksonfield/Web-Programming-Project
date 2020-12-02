const socket = io();
const canvas = document.getElementById('canvas');
let direction = null;
const styleCanvas = getComputedStyle(canvas);
let id = "";
let player = false;
//sets size of grid
const boardSize = 50;

//initialises score
let score = 1;
const scoreEl = document.getElementById('score');
const highEl = document.getElementById('high_score');
//initialises the vision mechanic object values (at what sizes to change size)
const visionObj = {1: "800px", 4: "700px", 8: "600px", 12: "500px", 16: "400px", 20: "300px", 24: "200px", 28: "150px", 32: "100px", 36: "75px", 40: "50px" }
let currentVision = 1;
let params = new URLSearchParams(location.search);
//gets the players name from URL paramater
const playerName = params.get('name');

//gets exit button
const button = document.getElementById('exit');
let roomID = -1;
let currentRoom = {};
const overlay = document.getElementById("overlay");

//on exit button, takes player to main menu and updates stats
button.addEventListener('click', () => {
    window.location = "/";
    let temp = localStorage.getItem('snakeID');;
    let TEupdate = totalEaten;
    if(score > 1) TEupdate += (score-1);
    socket.emit("updateStats", {updateName: playerName, cookie: temp, dbHS: highScore, dbTE: TEupdate, dbW: wins})
  });

//emit to server a player has joined the game with their locally stored DB id
socket.emit('joinGame', { name: playerName, cookie: localStorage.getItem('snakeID') });

//sets the UUID in local storage
socket.on('setCookie', ({ cookie }) => {
    localStorage.setItem('snakeID',cookie);
})

//assign variables to user stats from DB
socket.on("sendStats", ({dbHighScore, dbTotalEaten, dbWins}) => {
    highScore = dbHighScore;
    totalEaten = dbTotalEaten;
    wins = dbWins;
    //updates high score display
    highEl.innerHTML = highScore;
})

socket.on('updatePlayers', ({ players, x, y, room, roomID }) => {
    outputPlayers(players, x, y)
    currentRoom = room;
})

let food_x = 1;
let food_y = 1;

//calls function to create the food object for players
socket.on('generateFood', ({ x, y }) => {
    food_x = x;
    food_y = y;
    generateFood();
})

//moves a given player after server has recieved it
socket.on('movePlayer', ({ direction, id }) => {
    outputMove(direction, id);
})

//gets a specific player
socket.on('getPlayer', ({playerData}) => {
    if (!player) {
        player = playerData
        roomID = player.roomID;
        let snake = document.querySelectorAll(`[data-id='${player.id}']`)
        console.log(snake)
        for(let i=0; i<snake.length; i++) {
            snake[i].className = "snake current-snake"
        }
    }
    
})

//places the food on screen in position from server
const generateFood = () => {
    const food = document.getElementById("food");
    
    food.style.gridRowStart = food_x;
    food.style.gridColumnStart = food_y;
    food.id = "food";
}

//validates that a food created isn't on top of another snake, if it is, a new food is generated
const foodValidation = () => {
    food_x = selectPos();
    food_y = selectPos();
    let snake_positions = Array.prototype.slice.call(document.querySelectorAll(".snake")).map(snakeItem => ({row: parseInt(snakeItem.style.gridRowStart), column: parseInt(snakeItem.style.gridColumnStart)}));
    while(snake_positions.some(item => item.row == food_x && item.column == food_y)) {
        food_x = selectPos();
        food_y = selectPos();
    }

    return food_x, food_y;
}

//generates a random x,y position on grid
function selectPos (){
    return Math.floor(Math.random() * (boardSize - 1) + 1);
}

generateFood();

const outputPlayers = (players, x, y) => {
    canvas.innerHTML = "";
    // if(players.length == 1) {
    //     overlay.style.display ="flex";
    //     overlay.innerHTML = "Waiting on another player to join...";
    // } else {
    //     overlay.style.display ="none";
    // }
    for(i=0; i<players.length; i++) {
        //creates the snake block elements on grid
        players[i].snake.forEach(snakePart => {
            let snake = document.createElement("div");
            snake.id = "snake";
            snake.className = "snake"
            if(player && player.id == players[i].id) {
                snake.className="snake current-snake"
            }
            //sets id value on snake so it can be fetched in other sections
            snake.setAttribute('data-id', players[i].id);
            //set snake coordinate
            snake.style.gridRowStart = snakePart.x;
            snake.style.gridColumnStart = snakePart.y;
            //appends snake to canvas
            canvas.appendChild(snake)
        })
    }
    //if the game is running and there is only 1 player, declares a winner
    if(players.length == 1 && currentRoom.started) {
        snake = document.querySelectorAll(`[data-id='${players[0].id}']`)
        winner(players[i].id);
    }
    
    //creates a food on canvas
    let food = document.createElement("div");
    food.id = "food"
    food.className = "food"
    food.style.gridRowStart = x;
    food.style.gridColumnStart = y;
    canvas.appendChild(food);
}

//changes player directly when a key is pressed
document.addEventListener("keydown", (e) => {
    if(currentRoom.started) {
        if(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.code)) {
            let snake = document.querySelectorAll(`[data-id='${player.id}']`)
            if((e.code == "ArrowLeft" && direction == "ArrowRight" || e.code == "ArrowRight" && direction == "ArrowLeft" || e.code == "ArrowUp" && direction == "ArrowDown" || e.code == "ArrowDown" && direction == "ArrowUp") && snake.length > 1) {
                return false;
            }
            direction = e.code;
        }
    }
    
});

//buttons to move player in direction on mobile 
const mobileMovement = document.querySelectorAll(".mobileMovement");
for (i = 0; i < mobileMovement.length; i++) {
    mobileMovement[i].addEventListener('click', (e) => {
      direction = e.target.getAttribute("data-move")
    });
  }

//reguarly makes server calls to update player locations
setInterval(() => { 
    if(direction != null && currentRoom.started) {
        socket.emit('movePlayer', {direction, room: player.roomID})
    }
}, 200);


//snake has died
const resetSnake = (snake) => {
    //gets the dead players ID
    let id = snake[0].getAttribute("data-id");

    //removes the dead snake from the grid on death
    for(i=0; i<snake.length; i++) {
        snake[i].remove();
    }

    //if you are the dead player
    if(player.id == id) {
        //On Death Update high score in DB
        let temp = localStorage.getItem('snakeID');;
        let TEupdate = totalEaten;
        if(score > 1) TEupdate += (score-1);
        socket.emit("updateStats", {updateName: playerName, cookie: temp, dbHS: highScore, dbTE: TEupdate, dbW: wins})

        //Gets rid of vision overlay after death
        let vision = document.getElementById("vision-overlay");
        vision.style.display = "none";

        //shows game over overlay
        let gameOver = document.getElementById("overlay");
        gameOver.style.display ="flex";
        overlay.innerHTML = "GAME OVER";
    }
    
}

//declares a winner
const winner = (id) => {
    let snake = document.querySelectorAll(`[data-id='${id}']`)

    //if your snake length = the number of total snake objects
    if((document.querySelectorAll(".snake").length == snake.length || document.querySelectorAll(".snake").length == 1) && currentRoom.started){
        //if you are the winner
        if(player.id == snake[0].getAttribute("data-id")){
            //resets room, and updates winners stats (increase win stat and high score)
            currentRoom.started = false;
            console.log("winner")
            let temp = localStorage.getItem('snakeID');;
            let TEupdate = totalEaten;
            if(score > 1) TEupdate += (score-1);
            socket.emit("updateStats", {updateName: playerName, cookie: temp, dbHS: highScore, dbTE: TEupdate, dbW: (wins+1)})
            overlay.style.display = "flex";
            overlay.innerHTML = "WINNER!";
        }
    }
}

//moves a given player, ran for all player but some parts are only performed if you are the moving player
const outputMove = (direction, id) => {
    
    let snake = document.querySelectorAll(`[data-id='${id}']`)
    let snake_copy = Array.prototype.slice.call(snake).map(snakeItem => ({row: snakeItem.style.gridRowStart, column: snakeItem.style.gridColumnStart}));

    if(snake.length == 0) {
        return false;
    }
    winner(id)

    for(i=1; i<snake.length; i++) {
        snake[i].style.gridRowStart = snake_copy[i - 1].row;
        snake[i].style.gridColumnStart = snake_copy[i - 1].column;
    }
    let style = getComputedStyle(snake[0]);
    let x = parseInt(style.gridRowStart);
    let y = parseInt(style.gridColumnStart);

    //moves snake head based on current direction
    switch(direction) {
        case "ArrowLeft":
            snake[0].style.gridColumnStart = `${y - 1 == 0 ? -1 : y - 1}`;
            break;
        case "ArrowRight":
            snake[0].style.gridColumnStart = `${y + 1}`;
            break;
        case "ArrowUp":
            snake[0].style.gridRowStart = `${x - 1 == 0 ? -1 : x - 1}`;
            break;
        case "ArrowDown":
            snake[0].style.gridRowStart = `${x + 1}`;
        default:
            break;
      }
    
    let food = document.getElementById("food");
    let styleFood = getComputedStyle(food);
      
    //if player has grabbed a food, grows snake and adds score
    if(style.gridColumnStart == styleFood.gridColumnStart && style.gridRowStart == styleFood.gridRowStart) {
        let snakePart = document.createElement("div");
        snakePart.id = "snake";
        snakePart.className = "snake"
        snakePart.setAttribute('data-id', id);
        snakePart.style.gridRowStart = snake_copy[snake_copy.length - 1].row;
        snakePart.style.gridColumnStart = snake_copy[snake_copy.length - 1].column;
        canvas.appendChild(snakePart)
        if(player.id == id) {
            score++;
            totalEaten++;
            scoreEl.innerHTML = score;
            if(score > highScore){
                highEl.innerHTML = score;
                highScore = score; }
        }
        

        socket.emit('generateFood', currentRoom.id)
    }

    //checks if a snake should be dead and runs kill function
    for(i=1; i < snake_copy.length - 1; i++) {
        if(snake_copy[i].row == snake[0].style.gridRowStart && snake_copy[i].column == snake[0].style.gridColumnStart) {
            resetSnake(snake);
        }
    }

    let snake_positions = Array.prototype.slice.call(document.querySelectorAll(`.snake`)).map(snakeItem => snakeItem.getAttribute("data-id") != id && ({row: parseInt(snakeItem.style.gridRowStart), column: parseInt(snakeItem.style.gridColumnStart)}));
    for(i=0; i < snake_positions.length; i++) {
        if(snake_positions[i].row == snake[0].style.gridRowStart && snake_positions[i].column == snake[0].style.gridColumnStart) {
            resetSnake(snake);
        }
    }

    //updates vision if you are the player being moved
    if(player.id == id) {
        let snake = document.querySelectorAll(`[data-id='${player.id}']`)
        const visionOverlay = document.getElementById("vision-overlay");
        if (snake.length in visionObj) {
            currentVision = visionObj[snake.length];
        }
        visionOverlay.style.background = `radial-gradient(circle at ${(snake[0].style.gridColumnStart * (100 / boardSize))-1}% ${(snake[0].style.gridRowStart * (100 / boardSize))-1}%,transparent 10px,rgba(0, 0, 0, 0.96) ${currentVision})`
    }

    //kills player if outside of board area
    if(x > boardSize || y > boardSize || x < 0 || y < 0) {
        resetSnake(snake);
    }
    // socket.emit('updatePosition', { id, positions });
}