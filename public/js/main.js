const socket = io();
const canvas = document.getElementById('canvas');
let direction = null;
const styleCanvas = getComputedStyle(canvas);
let id = "";
let player = false;
const boardSize = 70;
let score = 1;
let highScore = 1;
const scoreEl = document.getElementById('score');
const highEl = document.getElementById('high_score');

socket.emit('joinGame', { name: "Jason" });

socket.on('updatePlayers', ({ players }) => {
    outputPlayers(players)
})

socket.on('movePlayer', ({ direction, id }) => {
    outputMove(direction, id);
})

socket.on('getPlayer', ({playerData}) => {
    player = playerData
})

let food_x = 1;
let foox_y = 1;

const generateFood = () => {
    const food = document.getElementById("food");
    food_x = Math.floor(Math.random() * boardSize);
    food_y = Math.floor(Math.random() * boardSize);
    food.style.gridRowStart = food_x
    food.style.gridColumnStart = food_y
    food.id = "food";
}

generateFood();

const outputPlayers = players => {
    canvas.innerHTML = "";
    for(i=0; i<players.length; i++) {
        players[i].snake.forEach(snakePart => {
            let snake = document.createElement("div");
            snake.id = "snake";
            snake.className = "snake"
            snake.setAttribute('data-id', players[i].id);
            snake.style.gridRowStart = snakePart.x;
            snake.style.gridColumnStart = snakePart.y;
            canvas.appendChild(snake)
        })
    }

    let food = document.createElement("div");
    food.id = "food"
    food.className = "food"
    food.style.gridRowStart = food_x;
    food.style.gridColumnStart = food_y;
    canvas.appendChild(food);
}

document.addEventListener("keydown", (e) => {
    console.log(player)
    if(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.code)) {
        if((e.code == "ArrowLeft" && direction == "ArrowRight" || e.code == "ArrowRight" && direction == "ArrowLeft" || e.code == "ArrowUp" && direction == "ArrowDown" || e.code == "ArrowDown" && direction == "ArrowUp") && player.snake.length > 1) {
            return false;
        }
        direction = e.code;
    }
});

setInterval(() => { 
    if(direction != null) {
        socket.emit('movePlayer', {direction})
    }
}, 100);

const resetSnake = (snake) => {
    // Fix resetting snake at same location for all players
    for(i=1; i<snake.length; i++) {
        snake[i].remove();
    }
    const x = Math.floor(Math.random() * boardSize);
    const y = Math.floor(Math.random() * boardSize);
    snake[0].style.gridRowStart = x;
    snake[0].style.gridColumnStart = y;
    generateFood();

    //Compare with database high score
    score = 1;
    scoreEl.innerHTML = score;
}

const outputMove = (direction, id) => {
    let snake = document.querySelectorAll(`[data-id='${id}']`)
    let snake_copy = Array.prototype.slice.call(snake).map(snakeItem => ({row: snakeItem.style.gridRowStart, column: snakeItem.style.gridColumnStart}));

    for(i=1; i<snake.length; i++) {
        snake[i].style.gridRowStart = snake_copy[i - 1].row;
        snake[i].style.gridColumnStart = snake_copy[i - 1].column;
    }
    let style = getComputedStyle(snake[0]);
    let x = parseInt(style.gridRowStart);
    let y = parseInt(style.gridColumnStart);
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

    if(style.gridColumnStart == styleFood.gridColumnStart && style.gridRowStart == styleFood.gridRowStart) {
        let snakePart = document.createElement("div");
        snakePart.id = "snake";
        snakePart.className = "snake"
        snakePart.setAttribute('data-id', id);
        snakePart.style.gridRowStart = snake_copy[snake_copy.length - 1].row;
        snakePart.style.gridColumnStart = snake_copy[snake_copy.length - 1].column;
        canvas.appendChild(snakePart)
        score++;
        scoreEl.innerHTML = score;
        if(score > highScore){
            highEl.innerHTML = score;
            highScore = score; }
        generateFood();
    }

    for(i=1; i < snake_copy.length - 1; i++) {
        if(snake_copy[i].row == snake[0].style.gridRowStart && snake_copy[i].column == snake[0].style.gridColumnStart) {
            resetSnake(snake);
        }
    }

    if(x > boardSize || y > boardSize || x < 0 || y < 0) {
        resetSnake(snake);
    }

    snake = document.querySelectorAll(`[data-id='${id}']`);
    positions = Array.prototype.slice.call(snake).map(snakeItem => ({x: snakeItem.style.gridRowStart, y: snakeItem.style.gridColumnStart}));
    socket.emit('updatePosition', { id, positions });
}