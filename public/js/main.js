const socket = io();
const canvas = document.getElementById('canvas');
const snakes = document.getElementById('snakes');
const foods = document.getElementById('foods');
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
    const left = Math.floor(Math.random() * 100) + 1 + '%';
    const top = Math.floor(Math.random() * 100) + 1 + '%';
    food.style.left = left
    food.style.top = top
    food.id = "food";
}

generateFood();

const outputPlayers = players => {
    snakes.innerHTML = "";
    for(i=0; i<players.length; i++) {
        let snake = document.createElement("div");
        snake.id = "snake";
        snake.className = "snake"
        snake.setAttribute('data-id', players[i].id);
        snake.style.left = players[i].left;
        snake.style.top = players[i].top;
        snakes.appendChild(snake)
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
}, 50);

const resetSnake = (snake) => {
    snake.style.top = "50%";
    snake.style.left = "50%";
}

const outputMove = (direction, id) => {
    let snake = document.querySelector(`[data-id='${id}']`)
    let style = getComputedStyle(snake);
    const left = parseInt(style.left);
    const top = parseInt(style.top);
    switch(direction) {
        case "ArrowLeft":
            snake.style.left = `${left - 5}px`;
          break;
        case "ArrowRight":
            snake.style.left = `${left + 5}px`;
          break;
        case "ArrowUp":
            snake.style.top = `${top - 5}px`;
            break;
        case "ArrowDown":
            snake.style.top = `${top + 5}px`;
        default:
            break;
      }

    snake = document.querySelector(`[data-id='${id}']`)
    style = getComputedStyle(snake);
    let food = document.getElementById("food");
    let styleFood = getComputedStyle(food);
    if(style.left == styleFood.left && style.top == styleFood.top) {
        generateFood();
    }
    console.log(left)
    if (left < 5 || left >= (parseInt(styleCanvas.width)-10) || top < 5 || top >= (parseInt(styleCanvas.height)-10)) {
        resetSnake(snake);
    } 
}