const socket = io();
const canvas = document.getElementById('canvas');
// const snakes = document.getElementById('snakes');
// const foods = document.getElementById('foods');
let direction = null;
const styleCanvas = getComputedStyle(canvas);
let id = "";

socket.emit('joinGame', { name: "Jason" });

socket.on('updatePlayers', ({ players }) => {
    outputPlayers(players)
})

socket.on('movePlayer', ({ direction, id }) => {
    outputMove(direction, id);
})



const generateFood = () => {
    const food = document.getElementById("food");
    const x = Math.floor(Math.random() * 25);
    const y = Math.floor(Math.random() * 25);
    food.style.gridRowStart = x
    food.style.gridColumnStart = y
    food.id = "food";
}

generateFood();

const outputPlayers = players => {
    for(i=0; i<players.length; i++) {
        let snake = document.createElement("div");
        snake.id = "snake";
        snake.className = "snake"
        snake.setAttribute('data-id', players[i].id);
        snake.style.gridRowStart = players[i].x;
        snake.style.gridColumnStart = players[i].y;
        canvas.appendChild(snake)
    }
}

document.addEventListener("keydown", (e) => {
    if(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.code)) {
        direction = e.code;
    }
});

setInterval(() => { 
    if(direction != null) {
        socket.emit('movePlayer', {direction})
    }
}, 100);

const resetSnake = (snake) => {
    const x = Math.floor(Math.random() * 21);
    const y = Math.floor(Math.random() * 21);
    snake.style.gridRowStart = x;
    snake.style.gridColumnStart = y;
}

const outputMove = (direction, id) => {
    let snake = document.querySelector(`[data-id='${id}']`)
    let style = getComputedStyle(snake);
    let x = parseInt(style.gridRowStart);
    let y = parseInt(style.gridColumnStart);
    switch(direction) {
        case "ArrowLeft":
            snake.style.gridColumnStart = `${y - 1 == 0 ? -1 : y - 1}`;
            
          break;
        case "ArrowRight":
            snake.style.gridColumnStart = `${y + 1}`;
          break;
        case "ArrowUp":
            snake.style.gridRowStart = `${x - 1 == 0 ? -1 : x - 1}`;
            break;
        case "ArrowDown":
            snake.style.gridRowStart = `${x + 1}`;
        default:
            break;
      }

    snake = document.querySelector(`[data-id='${id}']`)
    style = getComputedStyle(snake);
    let food = document.getElementById("food");
    let styleFood = getComputedStyle(food);
    if(style.gridColumnStart == styleFood.gridColumnStart && style.gridRowStart == styleFood.gridRowStart) {
        generateFood();
    }
    if(x > 25 || y > 25 || x < 0 || y < 0) {
        resetSnake(snake);
    }
}